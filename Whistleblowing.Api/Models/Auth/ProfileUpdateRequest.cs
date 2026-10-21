using System.ComponentModel.DataAnnotations;

namespace Whistleblowing.Api.Models.Auth;

public sealed class ProfileUpdateRequest
{
    [Required, StringLength(150, MinimumLength = 2)]
    public string Name { get; set; } = string.Empty;

    [StringLength(20)]
    public string? Phone { get; set; }
}
