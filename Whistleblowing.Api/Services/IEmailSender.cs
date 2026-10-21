namespace Whistleblowing.Api.Services;

public interface IEmailSender
{
    bool IsConfigured { get; }
    Task SendPasswordResetAsync(string email, string resetUrl, CancellationToken cancellationToken);
}
