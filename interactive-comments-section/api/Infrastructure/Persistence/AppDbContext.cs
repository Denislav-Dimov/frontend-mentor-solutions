using Api.Features.Comments;
using Api.Features.Users;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Api.Infrastructure.Persistence;

public class AppDbContext(DbContextOptions<AppDbContext> options)
    : IdentityDbContext<ApplicationUser, IdentityRole<Guid>, Guid>(options) {
    public DbSet<Comment> Comments => Set<Comment>();
    public DbSet<CommentVote> CommentVotes => Set<CommentVote>();

    protected override void OnModelCreating(ModelBuilder builder) {
        base.OnModelCreating(builder);

        builder.Entity<ApplicationUser>(entity => {
            entity.Property(user => user.AvatarUrl).HasMaxLength(500);
            entity.Property(user => user.UserName).HasMaxLength(50).IsRequired();
            entity.Property(user => user.NormalizedUserName).HasMaxLength(50);
        });

        builder.Entity<Comment>(entity => {
            entity.HasKey(comment => comment.Id);
            entity.Property(comment => comment.Content)
                .IsRequired()
                .HasMaxLength(2_000);
            entity.HasOne(comment => comment.Author)
                .WithMany(user => user.Comments)
                .HasForeignKey(comment => comment.AuthorId);
            entity.HasOne(comment => comment.Parent)
                .WithMany(comment => comment.Replies)
                .HasForeignKey(comment => comment.ParentId);
        });

        builder.Entity<CommentVote>(entity => {
            entity.HasKey(vote => new { vote.UserId, vote.CommentId });
            entity.Property(vote => vote.Value).IsRequired();
            entity.Property(vote => vote.UpdatedAt).IsRequired();
            entity.HasIndex(vote => new { vote.CommentId, vote.UpdatedAt });
            entity.HasOne(vote => vote.User)
                .WithMany(user => user.CommentVotes)
                .HasForeignKey(vote => vote.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(vote => vote.Comment)
                .WithMany(comment => comment.Votes)
                .HasForeignKey(vote => vote.CommentId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}