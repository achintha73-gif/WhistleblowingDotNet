using Whistleblowing.Domain.Enums;

namespace Whistleblowing.Domain.Entities;

public class AdditionalInformation
{
    public int InfoId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public InformationType InformationType { get; set; } = InformationType.ADDITIONAL_DETAILS;
    public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
    public int? SubmittedBy { get; set; }
    public int ComplaintId { get; set; }

    // Navigation
    public User? SubmittedByUser { get; set; }
    public Complaint Complaint { get; set; } = null!;
}