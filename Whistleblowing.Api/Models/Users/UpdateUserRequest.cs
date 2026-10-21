using System.ComponentModel.DataAnnotations;
using Whistleblowing.Domain.Enums;

namespace Whistleblowing.Api.Models.Users;

public sealed class UpdateUserRequest
{
    [Required, StringLength(150, MinimumLength = 2)]
    public string Name { get; set; } = string.Empty;

    [Required, EmailAddress, StringLength(150)]
    public string Email { get; set; } = string.Empty;

    [StringLength(20)]
    public string? Phone { get; set; }

    [Range(1, int.MaxValue)]
    public int RoleId { get; set; }

    public int? DepartmentId { get; set; }

    public UserStatus Status { get; set; } = UserStatus.ACTIVE;
}
