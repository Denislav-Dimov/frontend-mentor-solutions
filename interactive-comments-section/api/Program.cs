using Api.Infrastructure.Configuration;

var builder = WebApplication.CreateBuilder(args);
builder.AddApiServices();

var app = builder.Build();
await app.InitializeDatabaseAsync();

app.UseApiPipeline();
app.MapApiEndpoints();

app.Run();