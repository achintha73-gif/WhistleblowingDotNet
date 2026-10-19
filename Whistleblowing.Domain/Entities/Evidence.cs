namespace Whistleblowing.Domain.Entities;

public class Evidence
{
    public int EvidenceId { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string FileType { get; set; } = string.Empty;
    public string? FilePath { get; set; }
    public int? FileSize { get; set; }
    public string? Description { get; set; }
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;

    public int? CaseId { get; set; }
    public int? ComplaintId { get; set; }
    public int? UploadedBy { get; set; }

    // Navigation
    public Case? Case { get; set; }
    public Complaint? Complaint { get; set; }
    public User? Uploader { get; set; }
}