using Amazon.S3;
using Amazon.S3.Model;
using System.Collections.Concurrent;
using System.Reflection;

namespace Api.Tests.Infrastructure;

public class FakeS3 {
    public IAmazonS3 Client { get; private set; } = null!;
    public ConcurrentBag<string> UploadedKeys { get; } = [];
    public ConcurrentBag<string> DeletedKeys { get; } = [];

    public static FakeS3 Create() {
        var fake = new FakeS3();
        var proxy = DispatchProxy.Create<IAmazonS3, Proxy>();
        ((Proxy)(object)proxy).Owner = fake;
        fake.Client = proxy;
        return fake;
    }

    public class Proxy : DispatchProxy {
        public FakeS3 Owner { get; set; } = null!;

        protected override object? Invoke(MethodInfo? targetMethod, object?[]? args) {
            switch (targetMethod?.Name) {
                case nameof(IAmazonS3.PutObjectAsync) when args is [PutObjectRequest request, ..]:
                    Owner.UploadedKeys.Add(request.Key);
                    break;
                case nameof(IAmazonS3.DeleteObjectAsync) when args is [DeleteObjectRequest request, ..]:
                    Owner.DeletedKeys.Add(request.Key);
                    break;
                case nameof(IAmazonS3.DeleteObjectAsync) when args is [string, string key, ..]:
                    Owner.DeletedKeys.Add(key);
                    break;
            }

            var returnType = targetMethod?.ReturnType;
            if (returnType is null || returnType == typeof(void)) {
                return null;
            }

            if (returnType == typeof(Task)) {
                return Task.CompletedTask;
            }

            if (returnType.IsGenericType && returnType.GetGenericTypeDefinition() == typeof(Task<>)) {
                var resultType = returnType.GetGenericArguments()[0];
                var result = resultType.GetConstructor(Type.EmptyTypes) is not null
                    ? Activator.CreateInstance(resultType)
                    : null;
                return typeof(Task)
                    .GetMethod(nameof(Task.FromResult))!
                    .MakeGenericMethod(resultType)
                    .Invoke(null, [result]);
            }

            return returnType.IsValueType ? Activator.CreateInstance(returnType) : null;
        }
    }
}
