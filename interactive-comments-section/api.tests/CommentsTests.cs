using Api.Tests.Infrastructure;
using System.Net;
using System.Net.Http.Json;
using System.Text.Json;

namespace Api.Tests;

[Collection(ApiCollection.Name)]
public class CommentsTests(ApiFactory factory) {
    [Fact]
    public async Task Create_comment_without_content_returns_validation_problem() {
        var client = await factory.CreateApiClientAsync();
        await client.RegisterAsync();

        var response = await client.Http.PostAsJsonAsync("/api/comments", new { parentId = (Guid?)null });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var problem = await ApiClient.ReadJsonAsync(response);
        Assert.True(problem.GetProperty("errors").TryGetProperty("content", out _));
    }

    [Fact]
    public async Task Other_users_cannot_edit_or_delete_a_comment() {
        var author = await factory.CreateApiClientAsync();
        await author.RegisterAsync();
        var commentId = (await author.CreateCommentAsync("Mine")).GetProperty("id").GetGuid();
        var other = await factory.CreateApiClientAsync();
        await other.RegisterAsync();

        var edit = await other.Http.PutAsJsonAsync($"/api/comments/{commentId}", new { content = "Hijacked" });
        var delete = await other.Http.DeleteAsync($"/api/comments/{commentId}");

        Assert.Equal(HttpStatusCode.Forbidden, edit.StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, delete.StatusCode);
    }

    [Fact]
    public async Task Edit_returns_the_full_comment_shape() {
        var client = await factory.CreateApiClientAsync();
        var username = await client.RegisterAsync();
        var commentId = (await client.CreateCommentAsync("Before")).GetProperty("id").GetGuid();

        var response = await client.Http.PutAsJsonAsync($"/api/comments/{commentId}", new { content = "After" });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await ApiClient.ReadJsonAsync(response);
        Assert.Equal("After", body.GetProperty("content").GetString());
        Assert.Equal(username, body.GetProperty("author").GetProperty("username").GetString());
        Assert.Equal(JsonValueKind.Array, body.GetProperty("replies").ValueKind);
    }

    [Fact]
    public async Task Deleting_a_comment_removes_its_replies() {
        var client = await factory.CreateApiClientAsync();
        await client.RegisterAsync();
        var parentId = (await client.CreateCommentAsync("Parent")).GetProperty("id").GetGuid();
        var replyId = (await client.CreateCommentAsync("Reply", parentId)).GetProperty("id").GetGuid();
        await client.CreateCommentAsync("Nested", replyId);

        var response = await client.Http.DeleteAsync($"/api/comments/{parentId}");

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        var history = await client.Http.GetFromJsonAsync<JsonElement>("/api/comments/history");
        Assert.Equal(0, history.GetArrayLength());
    }

    [Fact]
    public async Task Voting_the_same_value_twice_toggles_it_off() {
        var author = await factory.CreateApiClientAsync();
        await author.RegisterAsync();
        var commentId = (await author.CreateCommentAsync("Vote on me")).GetProperty("id").GetGuid();
        var voter = await factory.CreateApiClientAsync();
        await voter.RegisterAsync();

        var up = await VoteAsync(voter, commentId, 1);
        var toggled = await VoteAsync(voter, commentId, 1);
        var down = await VoteAsync(voter, commentId, -1);

        Assert.Equal(1, up.GetProperty("currentUserVote").GetInt32());
        Assert.Equal(1, up.GetProperty("upvoteCount").GetInt32());
        Assert.Equal(JsonValueKind.Null, toggled.GetProperty("currentUserVote").ValueKind);
        Assert.Equal(0, toggled.GetProperty("upvoteCount").GetInt32());
        Assert.Equal(-1, down.GetProperty("currentUserVote").GetInt32());
        Assert.Equal(-1, down.GetProperty("score").GetInt32());
    }

    [Fact]
    public async Task Concurrent_first_votes_do_not_fail() {
        var author = await factory.CreateApiClientAsync();
        await author.RegisterAsync();
        var commentId = (await author.CreateCommentAsync("Race")).GetProperty("id").GetGuid();
        var voter = await factory.CreateApiClientAsync();
        await voter.RegisterAsync();

        var responses = await Task.WhenAll(Enumerable.Range(0, 5).Select(_ =>
            voter.Http.PutAsJsonAsync($"/api/comments/{commentId}/vote", new { value = 1 })));

        Assert.All(responses, response => Assert.Equal(HttpStatusCode.OK, response.StatusCode));
    }

    [Fact]
    public async Task Votes_pagination_reports_only_the_failing_parameter() {
        var client = await factory.CreateApiClientAsync();
        await client.RegisterAsync();
        var commentId = (await client.CreateCommentAsync("Paged")).GetProperty("id").GetGuid();

        var response = await client.Http.GetAsync($"/api/comments/{commentId}/votes?page=0");

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var errors = (await ApiClient.ReadJsonAsync(response)).GetProperty("errors");
        Assert.True(errors.TryGetProperty("page", out _));
        Assert.False(errors.TryGetProperty("pageSize", out _));
    }

    private static async Task<JsonElement> VoteAsync(ApiClient client, Guid commentId, int value) {
        var response = await client.Http.PutAsJsonAsync($"/api/comments/{commentId}/vote", new { value });
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        return await ApiClient.ReadJsonAsync(response);
    }
}
