using Api.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Api.Features.Comments;

public static class CommentsEndpoints {
    public static WebApplication MapCommentEndpoints(this WebApplication app) {
        var group = app.MapGroup("/api/comments").WithTags("Comments");

        group.MapGet("/", async (AppDbContext db, CancellationToken cancellationToken) => {
            var comments = await db.Comments
                .AsNoTracking()
                .Include(comment => comment.Author)
                .OrderByDescending(comment => comment.Score)
                .ToListAsync(cancellationToken);

            var responseComments = comments
                .Select(ToResponse)
                .ToList();

            var responsesById = responseComments
                .ToDictionary(comment => comment.Id);

            foreach (var comment in responseComments.Where(comment => comment.ParentId is not null)) {
                if (responsesById.TryGetValue(comment.ParentId!.Value, out var parent)) {
                    parent.Replies.Add(comment);
                }
            }

            foreach (var parent in responseComments.Where(comment => comment.ParentId is null)) {
                SortRepliesByCreatedAt(parent);
            }

            return Results.Ok(
                responseComments
                    .Where(comment => comment.ParentId is null)
                    .ToList());
        });

        group.MapPost("/", async (
            CreateCommentRequest request,
            ClaimsPrincipal principal,
            AppDbContext db,
            CancellationToken cancellationToken) => {
            var content = request.Content.Trim();

            if (content.Length is < 1 or > 2_000) {
                return Results.ValidationProblem(new Dictionary<string, string[]> {
                    ["content"] = ["Content must be between 1 and 2,000 characters."]
                });
            }

            if (!Guid.TryParse(principal.FindFirstValue(ClaimTypes.NameIdentifier), out var authorId)) {
                return Results.Unauthorized();
            }

            var authorExists = await db.Users.AnyAsync(user => user.Id == authorId, cancellationToken);

            if (!authorExists) {
                return Results.ValidationProblem(new Dictionary<string, string[]> {
                    ["author"] = ["Authenticated user does not exist."]
                });
            }

            if (request.ParentId is not null &&
                !await db.Comments.AnyAsync(comment => comment.Id == request.ParentId, cancellationToken)) {
                return Results.ValidationProblem(new Dictionary<string, string[]> {
                    ["parentId"] = ["Parent comment does not exist."]
                });
            }

            var comment = new Comment {
                Content = content,
                AuthorId = authorId,
                ParentId = request.ParentId
            };

            db.Comments.Add(comment);
            await db.SaveChangesAsync(cancellationToken);

            await db.Entry(comment).Reference(item => item.Author).LoadAsync(cancellationToken);
            return Results.Created($"/api/comments/{comment.Id}", ToResponse(comment));
        }).RequireAuthorization();

        group.MapPut("/{id:guid}/score", async (
            Guid id,
            UpdateScoreRequest request,
            AppDbContext db,
            CancellationToken cancellationToken) => {
            if (request.Score is < -1 or > 1) {
                return Results.ValidationProblem(new Dictionary<string, string[]> {
                    ["score"] = ["Score must be -1, 0, or 1."]
                });
            }

            var comment = await db.Comments
                .Include(item => item.Author)
                .SingleOrDefaultAsync(item => item.Id == id, cancellationToken);

            if (comment is null) {
                return Results.NotFound();
            }

            comment.Score = request.Score;
            await db.SaveChangesAsync(cancellationToken);
            return Results.Ok(ToResponse(comment));
        }).RequireAuthorization();

        group.MapDelete("/{id:guid}", async (
            Guid id,
            AppDbContext db,
            CancellationToken cancellationToken) => {
            var comment = await db.Comments.FindAsync([id], cancellationToken);

            if (comment is null) {
                return Results.NotFound();
            }

            db.Comments.Remove(comment);
            await db.SaveChangesAsync(cancellationToken);
            return Results.NoContent();
        }).RequireAuthorization();

        return app;
    }

    private static CommentResponse ToResponse(Comment comment) =>
        new(
            comment.Id,
            comment.Content,
            comment.Score,
            comment.CreatedAt,
            new AuthorResponse(comment.Author.Id, comment.Author.UserName!, comment.Author.AvatarUrl),
            comment.ParentId,
            []
        );

    private static void SortRepliesByCreatedAt(CommentResponse comment) {
        comment.Replies.Sort((first, second) =>
            first.CreatedAt.CompareTo(second.CreatedAt));

        foreach (var reply in comment.Replies) {
            SortRepliesByCreatedAt(reply);
        }
    }

    private record CreateCommentRequest(string Content, Guid? ParentId);

    private record UpdateScoreRequest(int Score);

    private record CommentResponse(
        Guid Id,
        string Content,
        int Score,
        DateTime CreatedAt,
        AuthorResponse Author,
        Guid? ParentId,
        List<CommentResponse> Replies
    );

    private record AuthorResponse(Guid Id, string Username, string? AvatarUrl);
}