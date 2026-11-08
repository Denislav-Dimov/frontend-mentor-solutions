using Microsoft.AspNetCore.Antiforgery;

namespace Api.Infrastructure.Security;

public class AntiforgeryEndpointFilter : IEndpointFilter {
    public const string AntiforgeryErrorMessage = "A valid antiforgery token is required.";

    public async ValueTask<object?> InvokeAsync(
        EndpointFilterInvocationContext context,
        EndpointFilterDelegate next) {
        var antiforgery = context.HttpContext.RequestServices
            .GetRequiredService<IAntiforgery>();

        try {
            await antiforgery.ValidateRequestAsync(context.HttpContext);
        } catch (AntiforgeryValidationException) {
            return Results.Problem(
                statusCode: StatusCodes.Status400BadRequest,
                title: "Invalid antiforgery token.",
                detail: AntiforgeryErrorMessage,
                extensions: new Dictionary<string, object?> {
                    ["error"] = AntiforgeryErrorMessage
                });
        }

        return await next(context);
    }
}