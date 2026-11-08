using Api.Infrastructure.Persistence;
using Api.Infrastructure.Security;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using System.Diagnostics.CodeAnalysis;
using System.Security.Claims;

namespace Api.Features.Comments;

public static class CommentsEndpoints {
    public static WebApplication MapCommentEndpoints(this WebApplication app) {
        var group = app.MapGroup("/api/comments").WithTags("Comments");

        group.MapGet("/", async (
            ClaimsPrincipal principal,
            AppDbContext db,
            Infrastructure.Configuration.ServiceCollectionExtensions.StorageOptions storageOptions,
            CancellationToken cancellationToken) => {
            var comments = await db.Comments
                .AsNoTracking()
                .Include(comment => comment.Author)
                .Include(comment => comment.Votes)
                .ToListAsync(cancellationToken);

            var currentUserId = GetUserId(principal);
            var defaultAvatarUrl = storageOptions.DefaultAvatarUrl();
            var responseComments = comments
                .Select(comment => ToResponse(comment, currentUserId, defaultAvatarUrl))
                .OrderByDescending(comment => comment.Score)
                .ToList();

            var responsesById = responseComments
                .ToDictionary(comment => comment.Id);

            foreach (var comment in responseComments.Where(comment => comment.ParentId is not null)) {
                var root = FindRoot(comment, responsesById);
                if (root is not null && root.Id != comment.Id) {
                    root.Replies.Add(comment);
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

        group.MapGet("/history", async (
            ClaimsPrincipal principal,
            AppDbContext db,
            Infrastructure.Configuration.ServiceCollectionExtensions.StorageOptions storageOptions,
            CancellationToken cancellationToken) => {
            var userId = GetUserId(principal);

            if (userId is null) {
                return Results.Unauthorized();
            }

            var defaultAvatarUrl = storageOptions.DefaultAvatarUrl();
            var history = await db.Comments
                .AsNoTracking()
                .Where(comment => comment.AuthorId == userId.Value)
                .OrderByDescending(comment => comment.CreatedAt)
                .Select(comment => new {
                    comment.Id,
                    comment.Content,
                    comment.CreatedAt,
                    comment.ParentId,
                    Author = new AuthorResponse(
                        comment.Author.Id,
                        comment.Author.UserName!,
                        comment.Author.AvatarUrl ?? defaultAvatarUrl,
                        comment.Author.IsSeeded)
                })
                .ToListAsync(cancellationToken);

            return Results.Ok(history);
        }).RequireAuthorization();

        group.MapPost("/", async (
                CreateCommentRequest request,
                ClaimsPrincipal principal,
                AppDbContext db,
                Infrastructure.Configuration.ServiceCollectionExtensions.StorageOptions storageOptions,
                CancellationToken cancellationToken) => {
                var content = request.Content?.Trim();

                if (!IsValidContent(content)) {
                    return InvalidContent();
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
                return Results.Created($"/api/comments/{comment.Id}",
                    ToResponse(comment, authorId, storageOptions.DefaultAvatarUrl()));
            })
            .RequireAuthorization()
            .RequireRateLimiting("mutation")
            .AddEndpointFilter<AntiforgeryEndpointFilter>();

        group.MapPut("/{id:guid}", async (
                Guid id,
                UpdateCommentRequest request,
                ClaimsPrincipal principal,
                AppDbContext db,
                Infrastructure.Configuration.ServiceCollectionExtensions.StorageOptions storageOptions,
                CancellationToken cancellationToken) => {
                var userId = GetUserId(principal);
                if (userId is null) return Results.Unauthorized();

                var content = request.Content?.Trim();
                if (!IsValidContent(content)) {
                    return InvalidContent();
                }

                var comment = await db.Comments
                    .Include(item => item.Author)
                    .Include(item => item.Votes)
                    .SingleOrDefaultAsync(item => item.Id == id, cancellationToken);
                if (comment is null) return Results.NotFound();
                if (comment.AuthorId != userId.Value) return Results.Forbid();

                comment.Content = content;
                await db.SaveChangesAsync(cancellationToken);
                return Results.Ok(ToResponse(comment, userId, storageOptions.DefaultAvatarUrl()));
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

                if (!await db.Comments.AnyAsync(item => item.Id == id, cancellationToken)) {
                    return Results.NotFound();
                }

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

                try {
                    await db.SaveChangesAsync(cancellationToken);
                } catch (DbUpdateException exception) when (
                    exception.InnerException is PostgresException {
                        SqlState: PostgresErrorCodes.UniqueViolation
                    }) {
                } catch (DbUpdateConcurrencyException) {
                }

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

                var authorId = await db.Comments
                    .Where(item => item.Id == id)
                    .Select(item => (Guid?)item.AuthorId)
                    .SingleOrDefaultAsync(cancellationToken);

                if (authorId is null) {
                    return Results.NotFound();
                }

                if (authorId != userId.Value) {
                    return Results.Forbid();
                }

                await db.Comments
                    .Where(item => item.Id == id)
                    .ExecuteDeleteAsync(cancellationToken);
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
            Infrastructure.Configuration.ServiceCollectionExtensions.StorageOptions storageOptions,
            CancellationToken cancellationToken) => {
            var requestedPage = page ?? 1;
            var requestedPageSize = pageSize ?? 20;

            var errors = new Dictionary<string, string[]>();
            if (requestedPage < 1) {
                errors["page"] = ["Page must be at least 1."];
            }

            if (requestedPageSize is < 1 or > 50) {
                errors["pageSize"] = ["Page size must be between 1 and 50."];
            }

            if (errors.Count > 0) {
                return Results.ValidationProblem(errors);
            }

            if (!await db.Comments.AnyAsync(comment => comment.Id == id, cancellationToken)) {
                return Results.NotFound();
            }

            var votes = db.CommentVotes
                .AsNoTracking()
                .Where(vote => vote.CommentId == id);
            var totalCount = await votes.CountAsync(cancellationToken);
            var defaultAvatarUrl = storageOptions.DefaultAvatarUrl();
            var items = await votes
                .OrderByDescending(vote => vote.UpdatedAt)
                .ThenBy(vote => vote.UserId)
                .Skip((requestedPage - 1) * requestedPageSize)
                .Take(requestedPageSize)
                .Select(vote => new VoteResponse(
                    new PublicUserResponse(
                        vote.User.Id,
                        vote.User.UserName!,
                        vote.User.AvatarUrl ?? defaultAvatarUrl,
                        vote.User.IsSeeded),
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

    private static CommentResponse ToResponse(Comment comment, Guid? currentUserId, string defaultAvatarUrl) {
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
            new AuthorResponse(comment.Author.Id, comment.Author.UserName!,
                comment.Author.AvatarUrl ?? defaultAvatarUrl, comment.Author.IsSeeded),
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

    private static CommentResponse? FindRoot(
        CommentResponse comment,
        Dictionary<Guid, CommentResponse> responsesById) {
        var current = comment;
        var visited = new HashSet<Guid> { current.Id };
        while (current.ParentId is not null &&
            responsesById.TryGetValue(current.ParentId.Value, out var parent)) {
            if (!visited.Add(parent.Id)) {
                return null;
            }
            current = parent;
        }
        return current.ParentId is null ? current : null;
    }

    private static void SortRepliesByCreatedAt(CommentResponse comment) {
        comment.Replies.Sort((first, second) =>
            first.CreatedAt.CompareTo(second.CreatedAt));

        foreach (var reply in comment.Replies) {
            SortRepliesByCreatedAt(reply);
        }
    }

    private static bool IsValidContent([NotNullWhen(true)] string? content) =>
        content is { Length: >= 1 and <= 2_000 };

    private static IResult InvalidContent() =>
        Results.ValidationProblem(new Dictionary<string, string[]> {
            ["content"] = ["Content must be between 1 and 2,000 characters."]
        });

    private record CreateCommentRequest(string? Content, Guid? ParentId);

    private record UpdateCommentRequest(string? Content);

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

    private record AuthorResponse(Guid Id, string Username, string? AvatarUrl, bool IsSeeded);

    private record PublicUserResponse(Guid Id, string Username, string? AvatarUrl, bool IsSeeded);

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