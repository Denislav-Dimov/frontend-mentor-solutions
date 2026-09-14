using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Amazon.S3;
using Amazon.S3.Model;
using Api.Infrastructure.Security;
using System.Net.Mail;
using System.Security.Claims;

namespace Api.Features.Users;

public static class UsersEndpoints {
    public static WebApplication MapUserEndpoints(this WebApplication app) {
        var group = app.MapGroup("/api/users").WithTags("Users");

        group.MapGet("/", async (
            UserManager<ApplicationUser> userManager,
            Infrastructure.Configuration.ServiceCollectionExtensions.StorageOptions storageOptions,
            CancellationToken cancellationToken) => {
            var defaultAvatarUrl = storageOptions.DefaultAvatarUrl();
            var users = await userManager.Users
                .AsNoTracking()
                .OrderBy(user => user.UserName)
                .Select(user => new UserResponse(user.Id, user.UserName!, user.AvatarUrl ?? defaultAvatarUrl, user.IsSeeded))
                .ToListAsync(cancellationToken);

            return Results.Ok(users);
        }).RequireAuthorization();

        group.MapGet("/me", async (
            ClaimsPrincipal principal,
            UserManager<ApplicationUser> userManager,
            Infrastructure.Configuration.ServiceCollectionExtensions.StorageOptions storageOptions) => {
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
            Infrastructure.Configuration.ServiceCollectionExtensions.StorageOptions storageOptions,
            CancellationToken cancellationToken) => {
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
                return Results.ValidationProblem(result.Errors
                    .GroupBy(error => error.Code)
                    .ToDictionary(
                        group => group.Key,
                        group => group.Select(error => error.Description).ToArray()));
            }

            await signInManager.SignInAsync(user, isPersistent: true);
            return Results.Created($"/api/users/{user.Id}",
                new UserResponse(user.Id, user.UserName!, user.AvatarUrl, user.IsSeeded));
        })
        .RequireRateLimiting("auth")
        .AddEndpointFilter<AntiforgeryEndpointFilter>();

        group.MapPost("/login", async (
            LoginRequest request,
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            Infrastructure.Configuration.ServiceCollectionExtensions.StorageOptions storageOptions) => {
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
                return Results.Unauthorized();
            }

            var result = await signInManager.PasswordSignInAsync(
                user,
                request.Password,
                isPersistent: true,
                lockoutOnFailure: true);

            return result.Succeeded
                ? Results.Ok(new UserResponse(user.Id, user.UserName!, user.AvatarUrl ?? storageOptions.DefaultAvatarUrl(), user.IsSeeded))
                : Results.Unauthorized();
        })
        .RequireRateLimiting("auth")
        .AddEndpointFilter<AntiforgeryEndpointFilter>();

        group.MapPost("/logout", async (SignInManager<ApplicationUser> signInManager) => {
            await signInManager.SignOutAsync();
            return Results.NoContent();
        })
        .RequireAuthorization()
        .RequireRateLimiting("mutation")
        .AddEndpointFilter<AntiforgeryEndpointFilter>();

        group.MapPut("/me", async (
            UpdateProfileRequest request,
            ClaimsPrincipal principal,
            UserManager<ApplicationUser> userManager,
            Infrastructure.Configuration.ServiceCollectionExtensions.StorageOptions storageOptions,
            CancellationToken cancellationToken) => {
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
                return Results.ValidationProblem(result.Errors
                    .GroupBy(error => error.Code)
                    .ToDictionary(
                        group => group.Key,
                        group => group.Select(error => error.Description).ToArray()));
            }

            return Results.Ok(ToResponse(user, storageOptions));
        })
        .RequireAuthorization()
        .RequireRateLimiting("mutation")
        .AddEndpointFilter<AntiforgeryEndpointFilter>();

        group.MapDelete("/me", async (
            ClaimsPrincipal principal,
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager) => {
            var userId = GetUserId(principal);
            if (userId is null) {
                return Results.Unauthorized();
            }

            var user = await userManager.FindByIdAsync(userId.Value.ToString());
            if (user is null) {
                return Results.NotFound();
            }

            var result = await userManager.DeleteAsync(user);
            if (!result.Succeeded) {
                return Results.ValidationProblem(result.Errors
                    .GroupBy(error => error.Code)
                    .ToDictionary(
                        group => group.Key,
                        group => group.Select(error => error.Description).ToArray()));
            }

            await signInManager.SignOutAsync();
            return Results.NoContent();
        })
        .RequireAuthorization()
        .RequireRateLimiting("mutation")
        .AddEndpointFilter<AntiforgeryEndpointFilter>();

        group.MapPost("/me/avatar", async (
            IFormFile file,
            ClaimsPrincipal principal,
            UserManager<ApplicationUser> userManager,
            IAmazonS3 storage,
            Infrastructure.Configuration.ServiceCollectionExtensions.StorageOptions storageOptions,
            CancellationToken cancellationToken) => {
            if (file.Length is < 1 or > 2 * 1024 * 1024) {
                return Results.ValidationProblem(new Dictionary<string, string[]> {
                    ["file"] = ["Profile pictures must be between 1 byte and 2 MB."]
                });
            }

            var allowedContentTypes = new[] {
                "image/jpeg",
                "image/png",
                "image/webp"
            };

            if (!allowedContentTypes.Contains(file.ContentType, StringComparer.OrdinalIgnoreCase)) {
                return Results.ValidationProblem(new Dictionary<string, string[]> {
                    ["file"] = ["Only JPEG, PNG, and WebP images are supported."]
                });
            }

            if (!Guid.TryParse(principal.FindFirstValue(ClaimTypes.NameIdentifier), out var userId)) {
                return Results.Unauthorized();
            }

            var user = await userManager.FindByIdAsync(userId.ToString());
            if (user is null) {
                return Results.Unauthorized();
            }

            var extension = file.ContentType.ToLowerInvariant() switch {
                "image/jpeg" => "jpg",
                "image/png" => "png",
                "image/webp" => "webp",
                _ => throw new InvalidOperationException("Unsupported image content type.")
            };
            var key = $"avatars/{user.Id}/{Guid.NewGuid():N}.{extension}";

            await using var stream = file.OpenReadStream();
            await storage.PutObjectAsync(new PutObjectRequest {
                BucketName = storageOptions.Bucket,
                Key = key,
                InputStream = stream,
                ContentType = file.ContentType
            }, cancellationToken);

            var previousAvatarUrl = user.AvatarUrl;
            user.AvatarUrl = storageOptions.PublicUrlFor(key);

            var result = await userManager.UpdateAsync(user);
            if (!result.Succeeded) {
                await storage.DeleteObjectAsync(storageOptions.Bucket, key, cancellationToken);
                return Results.ValidationProblem(result.Errors
                    .GroupBy(error => error.Code)
                    .ToDictionary(
                        group => group.Key,
                        group => group.Select(error => error.Description).ToArray()));
            }

            if (storageOptions.TryGetKey(previousAvatarUrl, out var previousKey) &&
                !string.Equals(previousKey, Infrastructure.Configuration.ServiceCollectionExtensions.StorageOptions.DefaultAvatarKey, StringComparison.Ordinal)) {
                await storage.DeleteObjectAsync(
                    storageOptions.Bucket,
                    previousKey,
                    cancellationToken);
            }

            return Results.Ok(new UserResponse(user.Id, user.UserName!, user.AvatarUrl, user.IsSeeded));
        })
        .RequireAuthorization()
        .RequireRateLimiting("mutation")
        .AddEndpointFilter<AntiforgeryEndpointFilter>();

        return app;
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

    private static UserResponse ToResponse(
        ApplicationUser user,
        Infrastructure.Configuration.ServiceCollectionExtensions.StorageOptions storageOptions) =>
        new(user.Id, user.UserName!, user.AvatarUrl ?? storageOptions.DefaultAvatarUrl(), user.IsSeeded);

    private record RegisterRequest(string? Username, string? Email, string? Password);

    private record LoginRequest(string? UsernameOrEmail, string? Password);

    private record UpdateProfileRequest(string? Username);

    private record UserResponse(Guid Id, string Username, string? AvatarUrl, bool IsSeeded);
}