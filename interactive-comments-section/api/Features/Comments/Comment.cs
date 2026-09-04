using Api.Features.Users;

namespace Api.Features.Comments;

public class Comment {
    public Guid Id { get; set; } = Guid.NewGuid();

    public required string Content { get; set; }

    public int Score { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Guid AuthorId { get; set; }
    public ApplicationUser Author { get; set; } = null!;

    public Guid? ParentId { get; set; }
    public Comment? Parent { get; set; }

    public ICollection<Comment> Replies { get; } = [];
}