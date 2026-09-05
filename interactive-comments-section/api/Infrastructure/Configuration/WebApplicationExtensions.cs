using Api.Features.Comments;
using Api.Features.Users;
using Api.Infrastructure.Persistence;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Api.Infrastructure.Configuration;

public static class WebApplicationExtensions {
    public static async Task InitializeDatabaseAsync(this WebApplication app) {
        await using var scope = app.Services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        await db.Database.MigrateAsync();
        await DatabaseSeeder.SeedAsync(
            scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>(),
            db);
    }

    public static void UseApiPipeline(this WebApplication app) {
        if (app.Environment.IsDevelopment()) {
            app.MapOpenApi();
            app.UseSwaggerUI(options => {
                options.SwaggerEndpoint("/openapi/v1.json", "Interactive Comments API v1");
            });
        } else {
            app.UseHsts();
        }

        app.UseHttpsRedirection();
        app.UseCors("Frontend");
        app.UseAuthentication();
        app.UseRateLimiter();
        app.UseAuthorization();
        app.UseAntiforgery();

        app.Use(async (context, next) => {
            context.Response.Headers["X-Content-Type-Options"] = "nosniff";
            context.Response.Headers["Referrer-Policy"] = "no-referrer";
            await next();
        });
    }

    public static void MapApiEndpoints(this WebApplication app) {
        app.MapGet("/api/security/antiforgery", (
                HttpContext context,
                IAntiforgery antiforgery) => {
                var tokens = antiforgery.GetAndStoreTokens(context);
                return Results.Ok(new { token = tokens.RequestToken });
            })
            .WithTags("Security")
            .RequireRateLimiting("auth");

        app.MapGet("/api/health", async (
                AppDbContext db,
                CancellationToken cancellationToken) => {
                var databaseAvailable = await db.Database.CanConnectAsync(cancellationToken);
                return databaseAvailable
                    ? Results.Ok(new { status = "ok", database = "connected" })
                    : Results.Json(
                        new { status = "degraded", database = "unavailable" },
                        statusCode: StatusCodes.Status503ServiceUnavailable);
            })
            .WithTags("Health");

        app.MapUserEndpoints();
        app.MapCommentEndpoints();
    }
}