using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Api.Infrastructure.Security;
using System.Net.Mail;

namespace Api.Features.Users;

public static class UsersEndpoints {
    public static WebApplication MapUserEndpoints(this WebApplication app) {
        var group = app.MapGroup("/api/users").WithTags("Users");

        group.MapGet("/", async (
            UserManager<ApplicationUser> userManager,
            CancellationToken cancellationToken) => {
            var users = await userManager.Users
                .AsNoTracking()
                .OrderBy(user => user.UserName)
                .Select(user => new UserResponse(user.Id, user.UserName!, user.AvatarUrl))
                .ToListAsync(cancellationToken);

            return Results.Ok(users);
        }).RequireAuthorization();

        group.MapPost("/register", async (
            RegisterRequest request,
            UserManager<ApplicationUser> userManager,
            CancellationToken cancellationToken) => {
            var validation = ValidateRegistration(request);
            if (validation is not null) {
                return validation;
            }

            var user = new ApplicationUser {
                Id = Guid.NewGuid(),
                UserName = request.Username!.Trim(),
                Email = request.Email!.Trim()
            };

            var result = await userManager.CreateAsync(user, request.Password!);

            if (!result.Succeeded) {
                return Results.ValidationProblem(result.Errors
                    .GroupBy(error => error.Code)
                    .ToDictionary(
                        group => group.Key,
                        group => group.Select(error => error.Description).ToArray()));
            }

            return Results.Created($"/api/users/{user.Id}",
                new UserResponse(user.Id, user.UserName!, user.AvatarUrl));
        })
        .RequireRateLimiting("auth")
        .AddEndpointFilter<AntiforgeryEndpointFilter>();

        group.MapPost("/login", async (
            LoginRequest request,
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager) => {
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
                ? Results.Ok(new UserResponse(user.Id, user.UserName!, user.AvatarUrl))
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

    private record RegisterRequest(string? Username, string? Email, string? Password);

    private record LoginRequest(string? UsernameOrEmail, string? Password);

    private record UserResponse(Guid Id, string Username, string? AvatarUrl);
}