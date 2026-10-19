using System.Security.Policy;
using Whistleblowing.Domain.Enums;

namespace Whistleblowing.Domain.Entities;

public class Case
{
    public int CaseId { get; set; }
    public int ComplaintId { get; set; }
    public CaseStatus Status { get; set; } = CaseStatus.OPEN;
    public CasePriority Priority { get; set; } = CasePriority.MEDIUM;
    public int? AssignedInvestigatorId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ClosedAt { get; set; }

    // Navigation
    public Complaint Complaint { get; set; } = null!;
    public User? AssignedInvestigator { get; set; }
    public ICollection<CaseStatusHistory> StatusHistory { get; set; } = new List<CaseStatusHistory>();
    public ICollection<Evidence> Evidence { get; set; } = new List<Evidence>();
    public InvestigationReport? InvestigationReport { get; set; }
}