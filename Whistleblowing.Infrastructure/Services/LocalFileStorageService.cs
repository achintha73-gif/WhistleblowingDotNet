using Microsoft.Extensions.Hosting;
using Whistleblowing.Application.Common.Interfaces;

namespace Whistleblowing.Infrastructure.Services;

public class LocalFileStorageService : IFileStorageService
{
    private readonly string _uploadDirectory;

    public LocalFileStorageService(IHostEnvironment environment)
    {
        _uploadDirectory = Path.Combine(environment.ContentRootPath, "private-uploads");

        if (!Directory.Exists(_uploadDirectory))
        {
            Directory.CreateDirectory(_uploadDirectory);
        }
    }

    public async Task<string> SaveFileAsync(
        Stream fileStream,
        string originalFileName,
        CancellationToken cancellationToken = default
    )
    {
        var safeName = SanitizeFileName(originalFileName);
        var uniqueName = $"{Guid.NewGuid():N}-{safeName}";
        var filePath = Path.Combine(_uploadDirectory, uniqueName);

        using var output = new FileStream(filePath, FileMode.CreateNew, FileAccess.Write);
        await fileStream.CopyToAsync(output, cancellationToken);

        return uniqueName;
    }

    public Task<bool> DeleteFileAsync(
        string storedFileName,
        CancellationToken cancellationToken = default
    )
    {
        var filePath = Path.Combine(_uploadDirectory, storedFileName);
        if (!File.Exists(filePath))
        {
            return Task.FromResult(false);
        }

        File.Delete(filePath);
        return Task.FromResult(true);
    }

    public Task<Stream?> GetFileAsync(
        string storedFileName,
        CancellationToken cancellationToken = default
    )
    {
        var filePath = Path.Combine(_uploadDirectory, storedFileName);
        if (!File.Exists(filePath))
        {
            return Task.FromResult<Stream?>(null);
        }

        Stream stream = new FileStream(filePath, FileMode.Open, FileAccess.Read, FileShare.Read);
        return Task.FromResult<Stream?>(stream);
    }

    private static string SanitizeFileName(string fileName)
    {
        var safe = fileName
            .Replace("/", "_")
            .Replace("\\", "_")
            .Replace("..", "_");

        if (safe.Length > 200)
        {
            safe = safe.Substring(safe.Length - 200);
        }

        return safe;
    }
}