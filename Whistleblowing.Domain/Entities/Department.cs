namespace Whistleblowing.Domain.Entities;

public class Department
{
    public int DepartmentId { get; set; }
    public string DepartmentName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Status { get; set; } = "active";
    public int? ManagerId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public User? Manager { get; set; }
    public ICollection<User> Users { get; set; } = new List<User>();
}