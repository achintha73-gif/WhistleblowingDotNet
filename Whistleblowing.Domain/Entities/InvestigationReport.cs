namespace Whistleblowing.Domain.Entities;

public class InvestigationReport
{
    public int ReportId { get; set; }
    public string Findings { get; set; } = string.Empty;
    public string Recommendation { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public int CaseId { get; set; }

    // Navigation
    public Case Case { get; set; } = null!;
}