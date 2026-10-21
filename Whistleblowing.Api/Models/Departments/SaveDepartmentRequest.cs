using System.ComponentModel.DataAnnotations;

namespace Whistleblowing.Api.Models.Departments;

public sealed class SaveDepartmentRequest
{
    [Required, StringLength(150, MinimumLength = 2)]
    public string DepartmentName { get; set; } = string.Empty;

    [StringLength(2000)]
    public string? Description { get; set; }

    public int? ManagerId { get; set; }
}
