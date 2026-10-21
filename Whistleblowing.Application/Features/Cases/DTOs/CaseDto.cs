using Whistleblowing.Domain.Enums;

namespace Whistleblowing.Application.Features.Cases.DTOs;

public class CaseDto
{
    public int CaseId { get; set; }
    public int ComplaintId { get; set; }
    public string ComplaintTitle { get; set; } = string.Empty;
    public string? Category { get; set; }
    public bool IsAnonymous { get; set; }
    public CaseStatus Status { get; set; }
    public CasePriority Priority { get; set; }
    public int? AssignedInvestigatorId { get; set; }
    public string? AssignedInvestigatorIds { get; set; }
    public string? InvestigatorName { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
