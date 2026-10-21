using System.ComponentModel.DataAnnotations;

namespace Whistleblowing.Api.Models.Auth;

public sealed class ResetPasswordRequest
{
    [Required, EmailAddress, StringLength(254)]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string Token { get; set; } = string.Empty;

    [Required, RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$",
        ErrorMessage = "Use at least 8 characters with uppercase, lowercase, a number, and a symbol.")]
    public string NewPassword { get; set; } = string.Empty;
}
