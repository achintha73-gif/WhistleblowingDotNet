using Whistleblowing.Domain.Enums;

namespace Whistleblowing.Domain.Entities;

public class CaseStatusHistory
{
    public int HistoryId { get; set; }
    public CaseStatus Status { get; set; }
    public DateTime ChangedAt { get; set; } = DateTime.UtcNow;
    public int ChangedBy { get; set; }
    public int CaseId { get; set; }

    // Navigation
    public User ChangedByUser { get; set; } = null!;
    public Case Case { get; set; } = null!;
}