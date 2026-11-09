using System.ComponentModel.DataAnnotations;

namespace Whistleblowing.Api.Models.Auth;

public sealed class VerifyResetCodeRequest
{
    [Required, EmailAddress, StringLength(254)]
    public string Email { get; set; } = string.Empty;

    [Required, RegularExpression("^[0-9A-F]{16}$")]
    public string Code { get; set; } = string.Empty;
}
