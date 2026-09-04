using Api.Features.Comments;
using Api.Features.Users;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Api.Infrastructure.Persistence;

public static class DatabaseSeeder {
    private static readonly Guid AmyId = Guid.Parse("11111111-1111-1111-1111-111111111111");
    private static readonly Guid MaxId = Guid.Parse("22222222-2222-2222-2222-222222222222");
    private static readonly Guid RamsesId = Guid.Parse("33333333-3333-3333-3333-333333333333");
    private static readonly Guid JuliusId = Guid.Parse("44444444-4444-4444-4444-444444444444");

    private static readonly Guid FirstCommentId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
    private static readonly Guid SecondCommentId = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb");
    private static readonly Guid FirstReplyId = Guid.Parse("cccccccc-cccc-cccc-cccc-cccccccccccc");
    private static readonly Guid SecondReplyId = Guid.Parse("dddddddd-dddd-dddd-dddd-dddddddddddd");

    public static async Task SeedAsync(
        UserManager<ApplicationUser> userManager,
        AppDbContext db,
        CancellationToken cancellationToken = default) {
        var users = new[] {
            new ApplicationUser {
                Id = AmyId,
                UserName = "amyrobson",
                Email = "amyrobson@demo.local",
                EmailConfirmed = true,
                AvatarUrl = "/images/avatars/image-amyrobson.png"
            },
            new ApplicationUser {
                Id = MaxId,
                UserName = "maxblagun",
                Email = "maxblagun@demo.local",
                EmailConfirmed = true,
                AvatarUrl = "/images/avatars/image-maxblagun.png"
            },
            new ApplicationUser {
                Id = RamsesId,
                UserName = "ramsesmiron",
                Email = "ramsesmiron@demo.local",
                EmailConfirmed = true,
                AvatarUrl = "/images/avatars/image-ramsesmiron.png"
            },
            new ApplicationUser {
                Id = JuliusId,
                UserName = "juliusomo",
                Email = "juliusomo@demo.local",
                EmailConfirmed = true,
                AvatarUrl = "/images/avatars/image-juliusomo.png"
            }
        };

        foreach (var user in users) {
            if (await userManager.FindByIdAsync(user.Id.ToString()) is not null) {
                continue;
            }

            var result = await userManager.CreateAsync(user);

            if (!result.Succeeded) {
                throw new InvalidOperationException(
                    $"Unable to seed user '{user.UserName}': " +
                    string.Join("; ", result.Errors.Select(error => error.Description)));
            }
        }

        var comments = new[] {
            new Comment {
                Id = FirstCommentId,
                Content =
                    "Impressive! Though it seems the drag feature could be improved. But overall it looks incredible. You've nailed the design and the responsiveness.",
                Score = 12,
                CreatedAt = new DateTime(2026, 8, 31, 10, 0, 0, DateTimeKind.Utc),
                AuthorId = AmyId
            },
            new Comment {
                Id = SecondCommentId,
                Content =
                    "Woah, your project looks awesome! How long have you been coding for? I'm still new, but think I want to dive into React as well soon. Perhaps you can give me an insight on where I can learn React? Thanks!",
                Score = 5,
                CreatedAt = new DateTime(2026, 9, 1, 12, 0, 0, DateTimeKind.Utc),
                AuthorId = MaxId
            },
            new Comment {
                Id = FirstReplyId,
                Content =
                    "If you're still new, I'd recommend focusing on the fundamentals of HTML, CSS, and JS before jumping into React. It's very important to understand the basics first.",
                Score = 4,
                CreatedAt = new DateTime(2026, 9, 2, 9, 0, 0, DateTimeKind.Utc),
                AuthorId = RamsesId,
                ParentId = SecondCommentId
            },
            new Comment {
                Id = SecondReplyId,
                Content =
                    "I couldn't agree more with this. Everything moves so fast and it always seems like everyone knows the newest, hottest framework/library. But the fundamentals are what stay constant.",
                Score = 2,
                CreatedAt = new DateTime(2026, 9, 2, 14, 0, 0, DateTimeKind.Utc),
                AuthorId = JuliusId,
                ParentId = SecondCommentId
            }
        };

        var existingCommentIds = await db.Comments
            .Where(comment => comments.Select(item => item.Id).Contains(comment.Id))
            .Select(comment => comment.Id)
            .ToListAsync(cancellationToken);

        db.Comments.AddRange(comments.Where(comment => !existingCommentIds.Contains(comment.Id)));
        await db.SaveChangesAsync(cancellationToken);
    }
}