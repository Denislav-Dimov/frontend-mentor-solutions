using Api.Features.Users;
using Api.Infrastructure.Persistence;
using Amazon.S3;
using Amazon.Runtime;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using System.Net;
using System.Threading.RateLimiting;

namespace Api.Infrastructure.Configuration;

public static class ServiceCollectionExtensions {
    private const long MaxRequestBodyBytes = 3 * 1024 * 1024;

    public static WebApplicationBuilder AddApiServices(this WebApplicationBuilder builder) {
        builder.Services.AddOpenApi();
        builder.Services.AddProblemDetails();
        builder.Services.ConfigureForwardedHeaders(builder.Configuration);

        var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
                               ?? throw new InvalidOperationException(
                                   "Connection string 'DefaultConnection' was not found.");
        var allowedOrigins = builder.Configuration
                                 .GetSection("Cors:AllowedOrigins")
                                 .Get<string[]>()
                             ?? throw new InvalidOperationException(
                                 "At least one CORS origin must be configured.");

        builder.Services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(connectionString));

        var storageOptions = StorageOptions.FromConfiguration(builder.Configuration);
        builder.Services.AddSingleton(storageOptions);
        builder.Services.AddSingleton<IAmazonS3>(_ =>
            new AmazonS3Client(
                new BasicAWSCredentials(
                    storageOptions.AccessKeyId,
                    storageOptions.SecretAccessKey),
                new AmazonS3Config {
                    ServiceURL = storageOptions.Endpoint,
                    AuthenticationRegion = storageOptions.Region,
                    ForcePathStyle = true
                }));

        builder.Services.AddCors(options =>
            options.AddPolicy("Frontend", policy => policy
                .WithOrigins(allowedOrigins)
                .AllowAnyMethod()
                .WithHeaders("Content-Type", "X-XSRF-TOKEN")
                .AllowCredentials()));

        builder.Services
            .AddIdentityCore<ApplicationUser>(options => {
                options.User.RequireUniqueEmail = true;
                options.Password.RequiredLength = 8;
                options.Password.RequireDigit = true;
                options.Password.RequireUppercase = true;
                options.Password.RequireNonAlphanumeric = false;
                options.Lockout.MaxFailedAccessAttempts = 10;
                options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(5);
            })
            .AddSignInManager()
            .AddEntityFrameworkStores<AppDbContext>()
            .AddDefaultTokenProviders();

        builder.Services
            .AddAuthentication(IdentityConstants.ApplicationScheme)
            .AddIdentityCookies();
        builder.Services.ConfigureApplicationCookie(options => {
            options.Cookie.HttpOnly = true;
            options.Cookie.SameSite = SameSiteMode.Lax;
            options.Cookie.SecurePolicy = builder.Environment.IsDevelopment()
                ? CookieSecurePolicy.SameAsRequest
                : CookieSecurePolicy.Always;
            options.SlidingExpiration = true;
            options.Events.OnRedirectToLogin = context => {
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                return Task.CompletedTask;
            };
            options.Events.OnRedirectToAccessDenied = context => {
                context.Response.StatusCode = StatusCodes.Status403Forbidden;
                return Task.CompletedTask;
            };
        });
        builder.Services.AddAuthorization();
        builder.Services.AddAntiforgery(options => {
            options.HeaderName = "X-XSRF-TOKEN";
            options.Cookie.Name = "XSRF-TOKEN";
            options.Cookie.HttpOnly = false;
            options.Cookie.SameSite = SameSiteMode.Lax;
            options.Cookie.SecurePolicy = builder.Environment.IsDevelopment()
                ? CookieSecurePolicy.SameAsRequest
                : CookieSecurePolicy.Always;
        });
        var globalPermitLimit = builder.Configuration.GetValue("RateLimiting:GlobalPermitLimit", 300);
        var authPermitLimit = builder.Configuration.GetValue("RateLimiting:AuthPermitLimit", 10);
        builder.Services.AddRateLimiter(options => {
            options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
            options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
                RateLimitPartition.GetFixedWindowLimiter(
                    context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                    _ => new FixedWindowRateLimiterOptions {
                        PermitLimit = globalPermitLimit,
                        Window = TimeSpan.FromMinutes(1),
                        QueueLimit = 0
                    }));
            options.AddPolicy("auth", context =>
                RateLimitPartition.GetFixedWindowLimiter(
                    context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                    _ => new FixedWindowRateLimiterOptions {
                        PermitLimit = authPermitLimit,
                        Window = TimeSpan.FromMinutes(1),
                        QueueLimit = 0
                    }));
            options.AddPolicy("antiforgery", context =>
                RateLimitPartition.GetFixedWindowLimiter(
                    context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                    _ => new FixedWindowRateLimiterOptions {
                        PermitLimit = 120,
                        Window = TimeSpan.FromMinutes(1),
                        QueueLimit = 0
                    }));
            options.AddPolicy("mutation", context =>
                RateLimitPartition.GetFixedWindowLimiter(
                    context.User.Identity?.Name
                    ?? context.Connection.RemoteIpAddress?.ToString()
                    ?? "unknown",
                    _ => new FixedWindowRateLimiterOptions {
                        PermitLimit = 120,
                        Window = TimeSpan.FromMinutes(1),
                        QueueLimit = 0
                    }));
        });
        builder.WebHost.ConfigureKestrel(options =>
            options.Limits.MaxRequestBodySize = MaxRequestBodyBytes);
        builder.Services.Configure<FormOptions>(options =>
            options.MultipartBodyLengthLimit = MaxRequestBodyBytes);

        return builder;
    }

    private static void ConfigureForwardedHeaders(
        this IServiceCollection services,
        IConfiguration configuration) {
        var knownProxies = configuration
                               .GetSection("ForwardedHeaders:KnownProxies")
                               .Get<string[]>()
                           ?? [];
        var knownNetworks = configuration
                                .GetSection("ForwardedHeaders:KnownNetworks")
                                .Get<string[]>()
                            ?? [];

        services.Configure<ForwardedHeadersOptions>(options => {
            options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
            options.ForwardLimit = 1;
            options.KnownProxies.Clear();
            options.KnownIPNetworks.Clear();

            // With no known proxies configured, the last hop is trusted from any peer, so direct callers can spoof it.
            foreach (var proxy in knownProxies) {
                options.KnownProxies.Add(IPAddress.Parse(proxy));
            }

            foreach (var network in knownNetworks) {
                options.KnownIPNetworks.Add(System.Net.IPNetwork.Parse(network));
            }
        });
    }

    public record StorageOptions(
        string AccessKeyId,
        string SecretAccessKey,
        string Endpoint,
        string Region,
        string Bucket) {
        public static StorageOptions FromConfiguration(IConfiguration configuration) {
            var values = new {
                AccessKeyId = GetValue(configuration, "Storage:AccessKeyId", "AWS_ACCESS_KEY_ID"),
                SecretAccessKey = GetValue(
                    configuration,
                    "Storage:SecretAccessKey",
                    "AWS_SECRET_ACCESS_KEY"),
                Endpoint = GetValue(configuration, "Storage:Endpoint", "AWS_ENDPOINT_URL_S3"),
                Region = GetValue(configuration, "Storage:Region", "AWS_REGION"),
                Bucket = GetValue(configuration, "Storage:Bucket", "AWS_S3_BUCKET")
            };

            var missing = new[] {
                (Name: "Storage:AccessKeyId or AWS_ACCESS_KEY_ID", Value: values.AccessKeyId),
                (
                    Name: "Storage:SecretAccessKey or AWS_SECRET_ACCESS_KEY",
                    Value: values.SecretAccessKey),
                (Name: "Storage:Endpoint or AWS_ENDPOINT_URL_S3", Value: values.Endpoint),
                (Name: "Storage:Region or AWS_REGION", Value: values.Region),
                (Name: "Storage:Bucket or AWS_S3_BUCKET", Value: values.Bucket)
            }
            .Where(item => string.IsNullOrWhiteSpace(item.Value))
            .Select(item => item.Name)
            .ToArray();

            if (missing.Length > 0) {
                throw new InvalidOperationException(
                    $"Missing Neon Object Storage configuration: {string.Join(", ", missing)}.");
            }

            return new StorageOptions(
                values.AccessKeyId!,
                values.SecretAccessKey!,
                values.Endpoint!.TrimEnd('/'),
                values.Region!,
                values.Bucket!);
        }

        private static string? GetValue(
            IConfiguration configuration,
            string primaryKey,
            string fallbackKey) =>
            configuration[primaryKey] ?? configuration[fallbackKey];

        public string PublicUrlFor(string key) =>
            $"{Endpoint}/{Uri.EscapeDataString(Bucket)}/{string.Join(
                "/",
                key.Split('/').Select(Uri.EscapeDataString))}";

        public const string DefaultAvatarKey = "avatars/image-default.png";

        public string DefaultAvatarUrl() => PublicUrlFor(DefaultAvatarKey);

        public bool TryGetKey(string? avatarUrl, out string key) {
            key = string.Empty;
            if (string.IsNullOrWhiteSpace(avatarUrl) ||
                !Uri.TryCreate(avatarUrl, UriKind.Absolute, out var uri) ||
                !uri.AbsoluteUri.StartsWith($"{Endpoint}/", StringComparison.OrdinalIgnoreCase)) {
                return false;
            }

            var prefix = $"/{Bucket}/";
            if (!uri.AbsolutePath.StartsWith(prefix, StringComparison.Ordinal)) {
                return false;
            }

            key = Uri.UnescapeDataString(uri.AbsolutePath[prefix.Length..]);
            return !string.IsNullOrWhiteSpace(key);
        }
    }
}