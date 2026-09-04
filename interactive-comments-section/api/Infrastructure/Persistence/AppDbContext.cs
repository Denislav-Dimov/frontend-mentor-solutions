using Api.Features.Comments;
using Api.Features.Users;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Api.Infrastructure.Persistence;

public class AppDbContext(DbContextOptions<AppDbContext> options)
    : IdentityDbContext<ApplicationUser, IdentityRole<Guid>, Guid>(options) {
    public DbSet<Comment> Comments => Set<Comment>();

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
    }
}