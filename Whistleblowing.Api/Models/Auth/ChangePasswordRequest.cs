using System.ComponentModel.DataAnnotations;

namespace Whistleblowing.Api.Models.Auth;

public sealed class ChangePasswordRequest
{
    [Required]
    public string CurrentPassword { get; set; } = string.Empty;

    [Required, RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$",
        ErrorMessage = "Use at least 8 characters with uppercase, lowercase, a number, and a symbol.")]
    public string NewPassword { get; set; } = string.Empty;
}
