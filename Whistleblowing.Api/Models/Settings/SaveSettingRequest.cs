using System.ComponentModel.DataAnnotations;

namespace Whistleblowing.Api.Models.Settings;

public sealed class SaveSettingRequest
{
    [Required, StringLength(100, MinimumLength = 2)]
    public string Key { get; set; } = string.Empty;

    [Required, StringLength(4000)]
    public string Value { get; set; } = string.Empty;

    [StringLength(2000)]
    public string? Description { get; set; }
}
