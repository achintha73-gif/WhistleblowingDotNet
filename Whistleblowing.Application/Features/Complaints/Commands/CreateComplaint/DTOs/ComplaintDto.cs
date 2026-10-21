namespace Whistleblowing.Application.Features.Complaints.DTOs;

/// <summary>
/// Complaint data returned to the client.
/// </summary>
public class ComplaintDto
{
    public int ComplaintId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? Category { get; set; }
    public string Status { get; set; } = string.Empty;
    public bool IsAnonymous { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Author info (null if anonymous)
    public int? AuthorId { get; set; }
    public string? AuthorName { get; set; }
    public string? AuthorEmail { get; set; }
    public List<Whistleblowing.Application.Features.Evidence.DTOs.EvidenceDto> Evidence { get; set; } = new();
    public List<AdditionalInformationDto> AdditionalInformation { get; set; } = new();
}

public class AdditionalInformationDto
{
    public int InfoId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string InformationType { get; set; } = string.Empty;
    public DateTime SubmittedAt { get; set; }
    public string? SubmittedByName { get; set; }
}
