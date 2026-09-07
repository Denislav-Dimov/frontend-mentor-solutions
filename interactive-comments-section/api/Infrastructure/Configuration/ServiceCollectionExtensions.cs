using Api.Features.Users;
using Api.Infrastructure.Persistence;
using Amazon.S3;
using Amazon.Runtime;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using System.Threading.RateLimiting;

namespace Api.Infrastructure.Configuration;

public static class ServiceCollectionExtensions {
    public static WebApplicationBuilder AddApiServices(this WebApplicationBuilder builder) {
        builder.Services.AddOpenApi();

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
                options.Lockout.MaxFailedAccessAttempts = 5;
            })
            .AddSignInManager()
            .AddEntityFrameworkStores<AppDbContext>()
            .AddDefaultTokenProviders();

        builder.Services
            .AddAuthentication(IdentityConstants.ApplicationScheme)
            .AddIdentityCookies();
        builder.Services.ConfigureApplicationCookie(options => {
            options.Cookie.HttpOnly = true;
            options.Cookie.SameSite = builder.Environment.IsDevelopment()
                ? SameSiteMode.Lax
                : SameSiteMode.None;
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
            options.Cookie.SameSite = builder.Environment.IsDevelopment()
                ? SameSiteMode.Lax
                : SameSiteMode.None;
            options.Cookie.SecurePolicy = builder.Environment.IsDevelopment()
                ? CookieSecurePolicy.SameAsRequest
                : CookieSecurePolicy.Always;
        });
        builder.Services.AddRateLimiter(options => {
            options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
            options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
                RateLimitPartition.GetFixedWindowLimiter(
                    context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                    _ => new FixedWindowRateLimiterOptions {
                        PermitLimit = 300,
                        Window = TimeSpan.FromMinutes(1),
                        QueueLimit = 0
                    }));
            options.AddPolicy("auth", context =>
                RateLimitPartition.GetFixedWindowLimiter(
                    context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                    _ => new FixedWindowRateLimiterOptions {
                        PermitLimit = 10,
                        Window = TimeSpan.FromMinutes(1),
                        QueueLimit = 0
                    }));
            options.AddPolicy("mutation", context =>
                RateLimitPartition.GetFixedWindowLimiter(
                    context.User.Identity?.Name
                    ?? context.Connection.RemoteIpAddress?.ToString()
                    ?? "unknown",
                    _ => new FixedWindowRateLimiterOptions {
                        PermitLimit = 60,
                        Window = TimeSpan.FromMinutes(1),
                        QueueLimit = 0
                    }));
        });
        builder.WebHost.ConfigureKestrel(options =>
            options.Limits.MaxRequestBodySize = 2 * 1024 * 1024);

        return builder;
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