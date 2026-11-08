using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Amazon.S3;
using Amazon.S3.Model;
using Api.Infrastructure.Security;
using System.Net.Mail;
using System.Security.Claims;
using StorageOptions = Api.Infrastructure.Configuration.ServiceCollectionExtensions.StorageOptions;

namespace Api.Features.Users;

public static class UsersEndpoints {
    private const long MaxAvatarBytes = 2 * 1024 * 1024;
    private const string LockedOutMessage = "Too many failed attempts. Try again in a few minutes.";
    private const string IncorrectPasswordMessage = "Incorrect password.";

    // Verified for unknown users so login timing doesn't reveal which accounts exist.
    private static readonly Lazy<string> DummyPasswordHash = new(() =>
        new PasswordHasher<ApplicationUser>().HashPassword(
            new ApplicationUser(),
            Guid.NewGuid().ToString("N")));

    private static readonly byte[] JpegSignature = [0xFF, 0xD8, 0xFF];
    private static readonly byte[] PngSignature = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];

    public static WebApplication MapUserEndpoints(this WebApplication app) {
        var group = app.MapGroup("/api/users").WithTags("Users");

        group.MapGet("/me", async (
            ClaimsPrincipal principal,
            UserManager<ApplicationUser> userManager,
            StorageOptions storageOptions) => {
            var userId = GetUserId(principal);
            if (userId is null) {
                return Results.Unauthorized();
            }

            var user = await userManager.FindByIdAsync(userId.Value.ToString());
            return user is null
                ? Results.Unauthorized()
                : Results.Ok(ToResponse(user, storageOptions));
        }).RequireAuthorization();

        group.MapPost("/register", async (
            RegisterRequest request,
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            StorageOptions storageOptions) => {
            var validation = ValidateRegistration(request);
            if (validation is not null) {
                return validation;
            }

            var user = new ApplicationUser {
                Id = Guid.NewGuid(),
                UserName = request.Username!.Trim(),
                Email = request.Email!.Trim(),
                AvatarUrl = storageOptions.DefaultAvatarUrl(),
                IsSeeded = false
            };

            var result = await userManager.CreateAsync(user, request.Password!);

            if (!result.Succeeded) {
                return ToValidationProblem(result);
            }

            await signInManager.SignInAsync(user, isPersistent: true);
            return Results.Created($"/api/users/{user.Id}", ToResponse(user, storageOptions));
        })
        .RequireRateLimiting("auth")
        .AddEndpointFilter<AntiforgeryEndpointFilter>();

        group.MapPost("/login", async (
            LoginRequest request,
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            StorageOptions storageOptions) => {
            if (string.IsNullOrWhiteSpace(request.UsernameOrEmail) ||
                string.IsNullOrEmpty(request.Password) ||
                request.UsernameOrEmail.Length > 256 ||
                request.Password.Length > 128) {
                return Results.Unauthorized();
            }

            var login = request.UsernameOrEmail.Trim();
            var user = await userManager.FindByNameAsync(login)
                       ?? await userManager.FindByEmailAsync(login);

            if (user is null) {
                userManager.PasswordHasher.VerifyHashedPassword(
                    new ApplicationUser(),
                    DummyPasswordHash.Value,
                    request.Password);
                return Results.Unauthorized();
            }

            var result = await signInManager.PasswordSignInAsync(
                user,
                request.Password,
                isPersistent: true,
                lockoutOnFailure: true);

            if (result.IsLockedOut) {
                return LockedOut();
            }

            return result.Succeeded
                ? Results.Ok(ToResponse(user, storageOptions))
                : Results.Unauthorized();
        })
        .RequireRateLimiting("auth")
        .AddEndpointFilter<AntiforgeryEndpointFilter>();

        group.MapPost("/logout", async (SignInManager<ApplicationUser> signInManager) => {
            await signInManager.SignOutAsync();
            return Results.NoContent();
        })
        .RequireRateLimiting("mutation")
        .AddEndpointFilter<AntiforgeryEndpointFilter>();

        group.MapPut("/me", async (
            UpdateProfileRequest request,
            ClaimsPrincipal principal,
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            StorageOptions storageOptions) => {
            var userId = GetUserId(principal);
            if (userId is null) {
                return Results.Unauthorized();
            }

            var user = await userManager.FindByIdAsync(userId.Value.ToString());
            if (user is null) {
                return Results.NotFound();
            }

            var username = request.Username?.Trim();
            if (string.IsNullOrWhiteSpace(username) || username.Length is < 3 or > 50) {
                return Results.ValidationProblem(new Dictionary<string, string[]> {
                    ["username"] = ["Name must be between 3 and 50 characters."]
                });
            }

            user.UserName = username;
            var result = await userManager.UpdateAsync(user);
            if (!result.Succeeded) {
                return ToValidationProblem(result);
            }

            await signInManager.RefreshSignInAsync(user);
            return Results.Ok(ToResponse(user, storageOptions));
        })
        .RequireAuthorization()
        .RequireRateLimiting("mutation")
        .AddEndpointFilter<AntiforgeryEndpointFilter>();

        group.MapDelete("/me", async (
            [FromBody] DeleteAccountRequest? request,
            ClaimsPrincipal principal,
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            IAmazonS3 storage,
            StorageOptions storageOptions,
            ILoggerFactory loggerFactory) => {
            var userId = GetUserId(principal);
            if (userId is null) {
                return Results.Unauthorized();
            }

            var user = await userManager.FindByIdAsync(userId.Value.ToString());
            if (user is null) {
                return Results.NotFound();
            }

            var password = request?.Password;
            if (string.IsNullOrEmpty(password) || password.Length > 128) {
                return IncorrectPassword();
            }

            var passwordCheck = await signInManager.CheckPasswordSignInAsync(
                user,
                password,
                lockoutOnFailure: true);
            if (passwordCheck.IsLockedOut) {
                return LockedOut();
            }

            if (!passwordCheck.Succeeded) {
                return IncorrectPassword();
            }

            var avatarUrl = user.AvatarUrl;
            var result = await userManager.DeleteAsync(user);
            if (!result.Succeeded) {
                return ToValidationProblem(result);
            }

            await TryDeleteAvatarAsync(
                storage,
                storageOptions,
                avatarUrl,
                loggerFactory.CreateLogger(typeof(UsersEndpoints)));

            await signInManager.SignOutAsync();
            return Results.NoContent();
        })
        .RequireAuthorization()
        .RequireRateLimiting("mutation")
        .AddEndpointFilter<AntiforgeryEndpointFilter>();

        group.MapPost("/me/avatar", async (
            IFormFile? file,
            ClaimsPrincipal principal,
            UserManager<ApplicationUser> userManager,
            IAmazonS3 storage,
            StorageOptions storageOptions,
            ILoggerFactory loggerFactory,
            CancellationToken cancellationToken) => {
            if (file is null || file.Length is < 1 or > MaxAvatarBytes) {
                return Results.ValidationProblem(new Dictionary<string, string[]> {
                    ["file"] = ["Profile pictures must be between 1 byte and 2 MB."]
                });
            }

            var imageType = await DetectImageTypeAsync(file, cancellationToken);
            if (imageType is null) {
                return Results.ValidationProblem(new Dictionary<string, string[]> {
                    ["file"] = ["Only JPEG, PNG, and WebP images are supported."]
                });
            }

            var userId = GetUserId(principal);
            if (userId is null) {
                return Results.Unauthorized();
            }

            var user = await userManager.FindByIdAsync(userId.Value.ToString());
            if (user is null) {
                return Results.Unauthorized();
            }

            var logger = loggerFactory.CreateLogger(typeof(UsersEndpoints));
            var key = $"avatars/{user.Id}/{Guid.NewGuid():N}.{imageType.Extension}";

            try {
                await using var stream = file.OpenReadStream();
                await storage.PutObjectAsync(new PutObjectRequest {
                    BucketName = storageOptions.Bucket,
                    Key = key,
                    InputStream = stream,
                    ContentType = imageType.ContentType
                }, cancellationToken);
            } catch (Exception exception) when (exception is not OperationCanceledException) {
                logger.LogError(exception, "Failed to upload avatar object {Key}.", key);
                return Results.Problem(
                    statusCode: StatusCodes.Status502BadGateway,
                    detail: "Avatar storage is unavailable. Try again later.");
            }

            var previousAvatarUrl = user.AvatarUrl;
            user.AvatarUrl = storageOptions.PublicUrlFor(key);

            var result = await userManager.UpdateAsync(user);
            if (!result.Succeeded) {
                await TryDeleteObjectAsync(storage, storageOptions, key, logger);
                return ToValidationProblem(result);
            }

            await TryDeleteAvatarAsync(storage, storageOptions, previousAvatarUrl, logger);

            return Results.Ok(ToResponse(user, storageOptions));
        })
        .RequireAuthorization()
        .RequireRateLimiting("mutation")
        .DisableAntiforgery()
        .AddEndpointFilter<AntiforgeryEndpointFilter>();

        return app;
    }

    private static IResult LockedOut() =>
        Results.Problem(
            statusCode: StatusCodes.Status429TooManyRequests,
            detail: LockedOutMessage);

    private static IResult IncorrectPassword() =>
        Results.ValidationProblem(new Dictionary<string, string[]> {
            ["password"] = [IncorrectPasswordMessage]
        });

    private static IResult ToValidationProblem(IdentityResult result) =>
        Results.ValidationProblem(result.Errors
            .GroupBy(error => error.Code)
            .ToDictionary(
                group => group.Key,
                group => group.Select(error => error.Description).ToArray()));

    private static async Task<ImageType?> DetectImageTypeAsync(
        IFormFile file,
        CancellationToken cancellationToken) {
        var header = new byte[12];
        await using var stream = file.OpenReadStream();
        var read = await stream.ReadAtLeastAsync(
            header,
            header.Length,
            throwOnEndOfStream: false,
            cancellationToken);
        var bytes = header.AsSpan(0, read);

        if (bytes.StartsWith(JpegSignature)) {
            return new ImageType("image/jpeg", "jpg");
        }

        if (bytes.StartsWith(PngSignature)) {
            return new ImageType("image/png", "png");
        }

        if (bytes.Length >= 12 &&
            bytes[..4].SequenceEqual("RIFF"u8) &&
            bytes[8..12].SequenceEqual("WEBP"u8)) {
            return new ImageType("image/webp", "webp");
        }

        return null;
    }

    private static async Task TryDeleteAvatarAsync(
        IAmazonS3 storage,
        StorageOptions storageOptions,
        string? avatarUrl,
        ILogger logger) {
        if (storageOptions.TryGetKey(avatarUrl, out var key) &&
            !string.Equals(key, StorageOptions.DefaultAvatarKey, StringComparison.Ordinal)) {
            await TryDeleteObjectAsync(storage, storageOptions, key, logger);
        }
    }

    private static async Task TryDeleteObjectAsync(
        IAmazonS3 storage,
        StorageOptions storageOptions,
        string key,
        ILogger logger) {
        try {
            await storage.DeleteObjectAsync(storageOptions.Bucket, key);
        } catch (Exception exception) {
            logger.LogWarning(exception, "Failed to delete avatar object {Key}.", key);
        }
    }

    private static IResult? ValidateRegistration(RegisterRequest request) {
        var errors = new Dictionary<string, string[]>();
        var username = request.Username?.Trim();
        var email = request.Email?.Trim();

        if (string.IsNullOrWhiteSpace(username) || username.Length is < 3 or > 50) {
            errors["username"] = ["Username must be between 3 and 50 characters."];
        }

        if (string.IsNullOrWhiteSpace(email) || email.Length > 256 || !IsValidEmail(email)) {
            errors["email"] = ["A valid email address is required."];
        }

        if (string.IsNullOrEmpty(request.Password) || request.Password.Length > 128) {
            errors["password"] = ["Password must be at most 128 characters long."];
        }

        return errors.Count == 0 ? null : Results.ValidationProblem(errors);
    }

    private static bool IsValidEmail(string email) {
        try {
            var address = new MailAddress(email);
            return string.Equals(address.Address, email, StringComparison.OrdinalIgnoreCase);
        }
        catch (FormatException) {
            return false;
        }
    }

    private static Guid? GetUserId(ClaimsPrincipal principal) =>
        Guid.TryParse(principal.FindFirstValue(ClaimTypes.NameIdentifier), out var userId)
            ? userId
            : null;

    private static UserResponse ToResponse(ApplicationUser user, StorageOptions storageOptions) =>
        new(user.Id, user.UserName!, user.AvatarUrl ?? storageOptions.DefaultAvatarUrl(), user.IsSeeded);

    private record RegisterRequest(string? Username, string? Email, string? Password);

    private record LoginRequest(string? UsernameOrEmail, string? Password);

    private record UpdateProfileRequest(string? Username);

    private record DeleteAccountRequest(string? Password);

    private record ImageType(string ContentType, string Extension);

    private record UserResponse(Guid Id, string Username, string? AvatarUrl, bool IsSeeded);
}
