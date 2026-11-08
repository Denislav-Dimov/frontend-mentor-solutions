using Amazon.S3;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Testcontainers.PostgreSql;

namespace Api.Tests.Infrastructure;

public class ApiFactory : WebApplicationFactory<Program>, IAsyncLifetime {
    private readonly PostgreSqlContainer _database = new PostgreSqlBuilder("postgres:17-alpine").Build();

    public FakeS3 Storage { get; } = FakeS3.Create();

    public async Task InitializeAsync() => await _database.StartAsync();

    public new async Task DisposeAsync() {
        await base.DisposeAsync();
        await _database.DisposeAsync();
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder) {
        builder.UseEnvironment("Testing");
        builder.UseSetting("ConnectionStrings:DefaultConnection", _database.GetConnectionString());
        builder.UseSetting("Storage:AccessKeyId", "test");
        builder.UseSetting("Storage:SecretAccessKey", "test");
        builder.UseSetting("Storage:Endpoint", "https://storage.test");
        builder.UseSetting("Storage:Region", "us-east-1");
        builder.UseSetting("Storage:Bucket", "bucket");
        builder.UseSetting("RateLimiting:GlobalPermitLimit", "100000");
        builder.UseSetting("RateLimiting:AuthPermitLimit", "100000");

        builder.ConfigureTestServices(services => {
            services.RemoveAll<IAmazonS3>();
            services.AddSingleton<IAmazonS3>(Storage.Client);
        });
    }

    public async Task<ApiClient> CreateApiClientAsync() {
        var client = CreateClient(new WebApplicationFactoryClientOptions {
            BaseAddress = new Uri("https://localhost"),
            HandleCookies = true,
            AllowAutoRedirect = false
        });
        var apiClient = new ApiClient(client);
        await apiClient.RefreshAntiforgeryAsync();
        return apiClient;
    }
}

[CollectionDefinition(Name)]
public class ApiCollection : ICollectionFixture<ApiFactory> {
    public const string Name = "api";
}
