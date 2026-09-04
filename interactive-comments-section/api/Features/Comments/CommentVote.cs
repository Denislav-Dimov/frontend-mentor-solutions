using Api.Features.Users;

namespace Api.Features.Comments;

public class CommentVote {
    public Guid UserId { get; set; }
    public ApplicationUser User { get; set; } = null!;

    public Guid CommentId { get; set; }
    public Comment Comment { get; set; } = null!;

    public int Value { get; set; }
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
