namespace Whistleblowing.Application.Common.Interfaces;

public interface IFileStorageService
{
    Task<string> SaveFileAsync(
        Stream fileStream,
        string originalFileName,
        CancellationToken cancellationToken = default
    );

    Task<bool> DeleteFileAsync(
        string storedFileName,
        CancellationToken cancellationToken = default
    );

    Task<Stream?> GetFileAsync(
        string storedFileName,
        CancellationToken cancellationToken = default
    );
}