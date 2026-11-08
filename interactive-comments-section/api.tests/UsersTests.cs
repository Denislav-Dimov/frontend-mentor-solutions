using Api.Tests.Infrastructure;
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;

namespace Api.Tests;

[Collection(ApiCollection.Name)]
public class UsersTests(ApiFactory factory) {
    private static readonly byte[] PngBytes = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0, 0, 0, 0];

    [Fact]
    public async Task Register_then_me_returns_the_new_user() {
        var client = await factory.CreateApiClientAsync();
        var username = await client.RegisterAsync();

        var response = await client.Http.GetAsync("/api/users/me");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await ApiClient.ReadJsonAsync(response);
        Assert.Equal(username, body.GetProperty("username").GetString());
    }

    [Fact]
    public async Task Login_with_wrong_password_or_unknown_user_returns_401() {
        var owner = await factory.CreateApiClientAsync();
        var username = await owner.RegisterAsync();
        var client = await factory.CreateApiClientAsync();

        var wrongPassword = await client.LoginAsync(username, "WrongPassword1");
        var unknownUser = await client.LoginAsync($"missing{Guid.NewGuid():N}", ApiClient.Password);

        Assert.Equal(HttpStatusCode.Unauthorized, wrongPassword.StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, unknownUser.StatusCode);
    }

    [Fact]
    public async Task Login_returns_429_once_the_account_is_locked_out() {
        var owner = await factory.CreateApiClientAsync();
        var username = await owner.RegisterAsync();
        var client = await factory.CreateApiClientAsync();

        for (var attempt = 1; attempt < 10; attempt++) {
            var failed = await client.LoginAsync(username, "WrongPassword1");
            Assert.Equal(HttpStatusCode.Unauthorized, failed.StatusCode);
        }

        var lockingAttempt = await client.LoginAsync(username, "WrongPassword1");
        var correctWhileLocked = await client.LoginAsync(username, ApiClient.Password);

        Assert.Equal(HttpStatusCode.TooManyRequests, lockingAttempt.StatusCode);
        Assert.Equal(HttpStatusCode.TooManyRequests, correctWhileLocked.StatusCode);
        var problem = await ApiClient.ReadJsonAsync(correctWhileLocked);
        Assert.Equal(
            "Too many failed attempts. Try again in a few minutes.",
            problem.GetProperty("detail").GetString());
    }

    [Fact]
    public async Task Mutation_without_antiforgery_token_returns_400_with_error() {
        var client = await factory.CreateApiClientAsync();
        await client.RegisterAsync();
        client.RemoveAntiforgeryHeader();

        var response = await client.Http.PostAsJsonAsync("/api/comments", new { content = "Hello" });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var body = await ApiClient.ReadJsonAsync(response);
        Assert.Equal("A valid antiforgery token is required.", body.GetProperty("error").GetString());
    }

    [Fact]
    public async Task Logout_without_a_session_returns_204() {
        var client = await factory.CreateApiClientAsync();

        var response = await client.Http.PostAsync("/api/users/logout", null);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    [Fact]
    public async Task Delete_account_requires_the_correct_password() {
        var client = await factory.CreateApiClientAsync();
        await client.RegisterAsync();

        var missing = await client.DeleteAccountAsync(null);
        var wrong = await client.DeleteAccountAsync(new { password = "WrongPassword1" });

        foreach (var response in new[] { missing, wrong }) {
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
            var problem = await ApiClient.ReadJsonAsync(response);
            Assert.Equal(
                "Incorrect password.",
                problem.GetProperty("errors").GetProperty("password")[0].GetString());
        }

        var deleted = await client.DeleteAccountAsync(new { password = ApiClient.Password });
        Assert.Equal(HttpStatusCode.NoContent, deleted.StatusCode);

        var me = await client.Http.GetAsync("/api/users/me");
        Assert.Equal(HttpStatusCode.Unauthorized, me.StatusCode);
    }

    [Fact]
    public async Task Avatar_type_comes_from_magic_bytes_and_is_removed_with_the_account() {
        var client = await factory.CreateApiClientAsync();
        await client.RegisterAsync();

        var spoofed = await UploadAvatarAsync(client, "not an image"u8.ToArray(), "image/png");
        Assert.Equal(HttpStatusCode.BadRequest, spoofed.StatusCode);
        var problem = await ApiClient.ReadJsonAsync(spoofed);
        Assert.True(problem.GetProperty("errors").TryGetProperty("file", out _));

        var uploaded = await UploadAvatarAsync(client, PngBytes, "text/plain");
        Assert.Equal(HttpStatusCode.OK, uploaded.StatusCode);
        var avatarUrl = (await ApiClient.ReadJsonAsync(uploaded)).GetProperty("avatarUrl").GetString()!;
        Assert.EndsWith(".png", avatarUrl);
        var key = factory.Storage.UploadedKeys.Single(item => avatarUrl.EndsWith(item));

        var deleted = await client.DeleteAccountAsync(new { password = ApiClient.Password });
        Assert.Equal(HttpStatusCode.NoContent, deleted.StatusCode);
        Assert.Contains(key, factory.Storage.DeletedKeys);
    }

    private static Task<HttpResponseMessage> UploadAvatarAsync(
        ApiClient client,
        byte[] bytes,
        string contentType) {
        var file = new ByteArrayContent(bytes);
        file.Headers.ContentType = new MediaTypeHeaderValue(contentType);
        var form = new MultipartFormDataContent { { file, "file", "avatar" } };
        return client.Http.PostAsync("/api/users/me/avatar", form);
    }
}
