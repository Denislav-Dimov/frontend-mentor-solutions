using System.Net;
using System.Net.Http.Json;
using System.Text.Json;

namespace Api.Tests.Infrastructure;

public class ApiClient(HttpClient http) {
    public const string Password = "Password123";
    private const string AntiforgeryHeader = "X-XSRF-TOKEN";

    public HttpClient Http { get; } = http;

    public async Task RefreshAntiforgeryAsync() {
        var response = await Http.GetFromJsonAsync<JsonElement>("/api/security/antiforgery");
        Http.DefaultRequestHeaders.Remove(AntiforgeryHeader);
        Http.DefaultRequestHeaders.Add(AntiforgeryHeader, response.GetProperty("token").GetString());
    }

    public void RemoveAntiforgeryHeader() => Http.DefaultRequestHeaders.Remove(AntiforgeryHeader);

    public async Task<string> RegisterAsync(string? username = null) {
        username ??= $"user{Guid.NewGuid():N}"[..20];
        var response = await Http.PostAsJsonAsync("/api/users/register", new {
            username,
            email = $"{username}@test.local",
            password = Password
        });
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        await RefreshAntiforgeryAsync();
        return username;
    }

    public async Task<HttpResponseMessage> LoginAsync(string usernameOrEmail, string password) {
        var response = await Http.PostAsJsonAsync("/api/users/login", new { usernameOrEmail, password });
        if (response.IsSuccessStatusCode) {
            await RefreshAntiforgeryAsync();
        }

        return response;
    }

    public async Task<JsonElement> CreateCommentAsync(string content, Guid? parentId = null) {
        var response = await Http.PostAsJsonAsync("/api/comments", new { content, parentId });
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        return await response.Content.ReadFromJsonAsync<JsonElement>();
    }

    public Task<HttpResponseMessage> DeleteAccountAsync(object? body) {
        var request = new HttpRequestMessage(HttpMethod.Delete, "/api/users/me");
        if (body is not null) {
            request.Content = JsonContent.Create(body);
        }

        return Http.SendAsync(request);
    }

    public static async Task<JsonElement> ReadJsonAsync(HttpResponseMessage response) =>
        await response.Content.ReadFromJsonAsync<JsonElement>();
}
