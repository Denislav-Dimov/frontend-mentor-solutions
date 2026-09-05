using Microsoft.AspNetCore.Antiforgery;

namespace Api.Infrastructure.Security;

public class AntiforgeryEndpointFilter : IEndpointFilter {
    public async ValueTask<object?> InvokeAsync(
        EndpointFilterInvocationContext context,
        EndpointFilterDelegate next) {
        var antiforgery = context.HttpContext.RequestServices
            .GetRequiredService<IAntiforgery>();

        try {
            await antiforgery.ValidateRequestAsync(context.HttpContext);
        } catch (AntiforgeryValidationException) {
            return Results.BadRequest(new {
                error = "A valid antiforgery token is required."
            });
        }

        return await next(context);
    }
}