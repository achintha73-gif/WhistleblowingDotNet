namespace Whistleblowing.Application.Features.Anonymous.DTOs;

public class TrackComplaintDto
{
    public string ReferenceCode { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? Category { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime SubmittedAt { get; set; }
    public DateTime LastUpdatedAt { get; set; }
}