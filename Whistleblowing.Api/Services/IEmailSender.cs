namespace Whistleblowing.Api.Services;

public interface IEmailSender
{
    bool IsConfigured { get; }
    Task SendCaseStatusAsync(string email, CancellationToken cancellationToken);
    Task SendPasswordResetAsync(string email, string resetCode, CancellationToken cancellationToken);
}
