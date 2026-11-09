using System.Net;
using System.Net.Mail;

namespace Whistleblowing.Api.Services;

public sealed class SmtpEmailSender(IConfiguration configuration) : IEmailSender
{
    public bool IsConfigured =>
        !string.IsNullOrWhiteSpace(configuration["Email:SmtpHost"]) &&
        !string.IsNullOrWhiteSpace(configuration["Email:From"]);

    public Task SendPasswordResetAsync(string email, string resetCode, CancellationToken cancellationToken) =>
        SendAsync(email, "Reset your Whistleblowing System password", $"We received a request to reset your password. Enter this code on the password reset page within 15 minutes:\n\n{resetCode}\n\nIf you did not request this, you can ignore this email.", cancellationToken);

    public Task SendCaseStatusAsync(string email, CancellationToken cancellationToken) =>
        SendAsync(email, "Your concern has an update", "There is an update to a concern you submitted. Please sign in to the whistleblowing system to view it.", cancellationToken);

    private async Task SendAsync(string email, string subject, string body, CancellationToken cancellationToken)
    {
        var host = configuration["Email:SmtpHost"];
        var from = configuration["Email:From"];
        if (string.IsNullOrWhiteSpace(host) || string.IsNullOrWhiteSpace(from))
            throw new InvalidOperationException("SMTP email settings are not configured.");

        using var message = new MailMessage(from, email)
        {
            Subject = subject,
            Body = body,
            IsBodyHtml = false
        };
        using var client = new SmtpClient(host, int.TryParse(configuration["Email:Port"], out var port) ? port : 587)
        {
            EnableSsl = bool.TryParse(configuration["Email:EnableSsl"], out var ssl) ? ssl : true,
            DeliveryMethod = SmtpDeliveryMethod.Network,
            Timeout = 15000
        };
        var username = configuration["Email:Username"];
        var password = configuration["Email:Password"];
        if (!string.IsNullOrWhiteSpace(username))
        {
            if (string.IsNullOrWhiteSpace(password))
                throw new InvalidOperationException("SMTP password is missing for the configured username.");

            client.Credentials = new NetworkCredential(username, password);
        }

        cancellationToken.ThrowIfCancellationRequested();
        await client.SendMailAsync(message, cancellationToken);
    }
}
