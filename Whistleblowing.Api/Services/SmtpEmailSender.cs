using System.Net;
using System.Net.Mail;

namespace Whistleblowing.Api.Services;

public sealed class SmtpEmailSender(IConfiguration configuration) : IEmailSender
{
    public bool IsConfigured =>
        !string.IsNullOrWhiteSpace(configuration["Email:SmtpHost"]) &&
        !string.IsNullOrWhiteSpace(configuration["Email:From"]);

    public async Task SendPasswordResetAsync(string email, string resetUrl, CancellationToken cancellationToken)
    {
        var host = configuration["Email:SmtpHost"];
        var from = configuration["Email:From"];
        if (string.IsNullOrWhiteSpace(host) || string.IsNullOrWhiteSpace(from))
            throw new InvalidOperationException("SMTP email settings are not configured.");

        using var message = new MailMessage(from, email)
        {
            Subject = "Reset your Whistleblowing System password",
            Body = $"We received a request to reset your password. Use this secure link within 30 minutes:\n\n{resetUrl}\n\nIf you did not request this, you can ignore this email.",
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
