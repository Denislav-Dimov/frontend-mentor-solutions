using Microsoft.AspNetCore.Identity;

namespace Api.Features.Users;

public class ApplicationUser : IdentityUser<Guid> {
    public string? AvatarUrl { get; set; }

    public ICollection<Api.Features.Comments.Comment> Comments { get; } = [];
}