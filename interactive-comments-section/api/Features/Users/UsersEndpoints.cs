using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

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
        });

        group.MapPost("/register", async (
            RegisterRequest request,
            UserManager<ApplicationUser> userManager,
            CancellationToken cancellationToken) => {
            var user = new ApplicationUser {
                Id = Guid.NewGuid(),
                UserName = request.Username.Trim(),
                Email = request.Email.Trim()
            };

            var result = await userManager.CreateAsync(user, request.Password);

            if (!result.Succeeded) {
                return Results.ValidationProblem(result.Errors
                    .GroupBy(error => error.Code)
                    .ToDictionary(
                        group => group.Key,
                        group => group.Select(error => error.Description).ToArray()));
            }

            return Results.Created($"/api/users/{user.Id}",
                new UserResponse(user.Id, user.UserName!, user.AvatarUrl));
        });

        group.MapPost("/login", async (
            LoginRequest request,
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager) => {
            var user = await userManager.FindByNameAsync(request.UsernameOrEmail.Trim())
                       ?? await userManager.FindByEmailAsync(request.UsernameOrEmail.Trim());

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
        });

        group.MapPost("/logout", async (SignInManager<ApplicationUser> signInManager) => {
            await signInManager.SignOutAsync();
            return Results.NoContent();
        });

        return app;
    }

    private record RegisterRequest(string Username, string Email, string Password);

    private record LoginRequest(string UsernameOrEmail, string Password);

    private record UserResponse(Guid Id, string Username, string? AvatarUrl);
}