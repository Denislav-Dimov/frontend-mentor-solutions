using Api.Infrastructure.Persistence;
using Api.Infrastructure.Security;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Api.Features.Comments;

public static class CommentsEndpoints {
    public static WebApplication MapCommentEndpoints(this WebApplication app) {
        var group = app.MapGroup("/api/comments").WithTags("Comments");

        group.MapGet("/", async (
            ClaimsPrincipal principal,
            AppDbContext db,
            CancellationToken cancellationToken) => {
            var comments = await db.Comments
                .AsNoTracking()
                .Include(comment => comment.Author)
                .Include(comment => comment.Votes)
                .ToListAsync(cancellationToken);

            var currentUserId = GetUserId(principal);
            var responseComments = comments
                .Select(comment => ToResponse(comment, currentUserId))
                .OrderByDescending(comment => comment.Score)
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
            return Results.Created($"/api/comments/{comment.Id}", ToResponse(comment, authorId));
        })
        .RequireAuthorization()
        .RequireRateLimiting("mutation")
        .AddEndpointFilter<AntiforgeryEndpointFilter>();

        group.MapPut("/{id:guid}/vote", async (
            Guid id,
            VoteRequest request,
            ClaimsPrincipal principal,
            AppDbContext db,
            CancellationToken cancellationToken) => {
            if (request.Value is not (-1 or 1)) {
                return Results.ValidationProblem(new Dictionary<string, string[]> {
                    ["value"] = ["Value must be -1 or 1."]
                });
            }

            var userId = GetUserId(principal);

            if (userId is null) {
                return Results.Unauthorized();
            }

            var comment = await db.Comments
                .SingleOrDefaultAsync(item => item.Id == id, cancellationToken);

            if (comment is null) {
                return Results.NotFound();
            }

            await using var transaction = await db.Database.BeginTransactionAsync(cancellationToken);
            var vote = await db.CommentVotes
                .SingleOrDefaultAsync(item =>
                        item.CommentId == id && item.UserId == userId.Value,
                    cancellationToken);

            if (vote is null) {
                db.CommentVotes.Add(new CommentVote {
                    CommentId = id,
                    UserId = userId.Value,
                    Value = request.Value
                });
            } else if (vote.Value == request.Value) {
                db.CommentVotes.Remove(vote);
            } else {
                vote.Value = request.Value;
                vote.UpdatedAt = DateTime.UtcNow;
            }

            await db.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);

            return Results.Ok(await GetVoteSummary(id, userId.Value, db, cancellationToken));
        })
        .RequireAuthorization()
        .RequireRateLimiting("mutation")
        .AddEndpointFilter<AntiforgeryEndpointFilter>();

        group.MapDelete("/{id:guid}", async (
            Guid id,
            ClaimsPrincipal principal,
            AppDbContext db,
            CancellationToken cancellationToken) => {
            var userId = GetUserId(principal);

            if (userId is null) {
                return Results.Unauthorized();
            }

            var comment = await db.Comments
                .SingleOrDefaultAsync(item => item.Id == id, cancellationToken);

            if (comment is null) {
                return Results.NotFound();
            }

            if (comment.AuthorId != userId.Value) {
                return Results.Forbid();
            }

            db.Comments.Remove(comment);
            await db.SaveChangesAsync(cancellationToken);
            return Results.NoContent();
        })
        .RequireAuthorization()
        .RequireRateLimiting("mutation")
        .AddEndpointFilter<AntiforgeryEndpointFilter>();

        group.MapGet("/{id:guid}/votes", async (
            Guid id,
            int? page,
            int? pageSize,
            AppDbContext db,
            CancellationToken cancellationToken) => {
            var requestedPage = page ?? 1;
            var requestedPageSize = pageSize ?? 20;

            if (requestedPage < 1 || requestedPageSize is < 1 or > 50) {
                return Results.ValidationProblem(new Dictionary<string, string[]> {
                    ["page"] = ["Page must be at least 1."],
                    ["pageSize"] = ["Page size must be between 1 and 50."]
                });
            }

            if (!await db.Comments.AnyAsync(comment => comment.Id == id, cancellationToken)) {
                return Results.NotFound();
            }

            var votes = db.CommentVotes
                .AsNoTracking()
                .Where(vote => vote.CommentId == id);
            var totalCount = await votes.CountAsync(cancellationToken);
            var items = await votes
                .OrderByDescending(vote => vote.UpdatedAt)
                .ThenBy(vote => vote.UserId)
                .Skip((requestedPage - 1) * requestedPageSize)
                .Take(requestedPageSize)
                .Select(vote => new VoteResponse(
                    new PublicUserResponse(
                        vote.User.Id,
                        vote.User.UserName!,
                        vote.User.AvatarUrl),
                    vote.Value,
                    vote.UpdatedAt))
                .ToListAsync(cancellationToken);

            return Results.Ok(new VotePageResponse(
                items,
                requestedPage,
                requestedPageSize,
                totalCount,
                requestedPage * requestedPageSize < totalCount
                    ? requestedPage + 1
                    : null));
        });

        return app;
    }

    private static async Task<VoteSummaryResponse> GetVoteSummary(
        Guid commentId,
        Guid userId,
        AppDbContext db,
        CancellationToken cancellationToken) {
        var votes = db.CommentVotes
            .AsNoTracking()
            .Where(vote => vote.CommentId == commentId);
        var counts = await votes
            .GroupBy(vote => vote.Value)
            .Select(group => new { Value = group.Key, Count = group.Count() })
            .ToListAsync(cancellationToken);
        var currentVote = await votes
            .Where(vote => vote.UserId == userId)
            .Select(vote => (int?)vote.Value)
            .SingleOrDefaultAsync(cancellationToken);
        var baseline = await db.Comments
            .Where(comment => comment.Id == commentId)
            .Select(comment => comment.Score)
            .SingleAsync(cancellationToken);
        var upvotes = counts.SingleOrDefault(item => item.Value == 1)?.Count ?? 0;
        var downvotes = counts.SingleOrDefault(item => item.Value == -1)?.Count ?? 0;

        return new VoteSummaryResponse(
            baseline + upvotes - downvotes,
            upvotes,
            downvotes,
            currentVote
        );
    }

    private static CommentResponse ToResponse(Comment comment, Guid? currentUserId) {
        var upvotes = comment.Votes.Count(vote => vote.Value == 1);
        var downvotes = comment.Votes.Count(vote => vote.Value == -1);
        var currentVote = currentUserId is null
            ? null
            : comment.Votes
                .Where(vote => vote.UserId == currentUserId.Value)
                .Select(vote => (int?)vote.Value)
                .SingleOrDefault();

        return new CommentResponse(
            comment.Id,
            comment.Content,
            comment.Score + upvotes - downvotes,
            comment.CreatedAt,
            new AuthorResponse(comment.Author.Id, comment.Author.UserName!, comment.Author.AvatarUrl),
            comment.ParentId,
            [],
            upvotes,
            downvotes,
            currentVote
        );
    }

    private static Guid? GetUserId(ClaimsPrincipal principal) =>
        Guid.TryParse(principal.FindFirstValue(ClaimTypes.NameIdentifier), out var userId)
            ? userId
            : null;

    private static void SortRepliesByCreatedAt(CommentResponse comment) {
        comment.Replies.Sort((first, second) =>
            first.CreatedAt.CompareTo(second.CreatedAt));

        foreach (var reply in comment.Replies) {
            SortRepliesByCreatedAt(reply);
        }
    }

    private record CreateCommentRequest(string Content, Guid? ParentId);

    private record VoteRequest(int Value);

    private record CommentResponse(
        Guid Id,
        string Content,
        int Score,
        DateTime CreatedAt,
        AuthorResponse Author,
        Guid? ParentId,
        List<CommentResponse> Replies,
        int UpvoteCount,
        int DownvoteCount,
        int? CurrentUserVote
    );

    private record AuthorResponse(Guid Id, string Username, string? AvatarUrl);

    private record PublicUserResponse(Guid Id, string Username, string? AvatarUrl);

    private record VoteResponse(PublicUserResponse User, int Value, DateTime UpdatedAt);

    private record VotePageResponse(
        List<VoteResponse> Items,
        int Page,
        int PageSize,
        int TotalCount,
        int? NextPage);

    private record VoteSummaryResponse(
        int Score,
        int UpvoteCount,
        int DownvoteCount,
        int? CurrentUserVote);
}