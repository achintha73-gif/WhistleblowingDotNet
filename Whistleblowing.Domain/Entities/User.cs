using System.Security.Policy;
using Whistleblowing.Domain.Enums;

namespace Whistleblowing.Domain.Entities;

public class User
{
    public int UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public UserStatus Status { get; set; } = UserStatus.ACTIVE;
    public int RoleId { get; set; }
    public int? DepartmentId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public Role Role { get; set; } = null!;
    public Department? Department { get; set; }

    public ICollection<Department> ManagedDepartments { get; set; } = new List<Department>();
    public ICollection<Complaint> Complaints { get; set; } = new List<Complaint>();
    public ICollection<AdditionalInformation> AdditionalInfo { get; set; } = new List<AdditionalInformation>();
    public ICollection<CaseStatusHistory> CaseStatusChanges { get; set; } = new List<CaseStatusHistory>();
    public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
    public ICollection<SystemSetting> SystemSettings { get; set; } = new List<SystemSetting>();
    public ICollection<Case> AssignedCases { get; set; } = new List<Case>();
    public ICollection<CaseInvestigator> CaseAssignments { get; set; } = new List<CaseInvestigator>();
    public ICollection<Evidence> UploadedEvidence { get; set; } = new List<Evidence>();
    public ICollection<PasswordResetToken> PasswordResetTokens { get; set; } = new List<PasswordResetToken>();
}
