namespace Whistleblowing.Application.Features.Evidence.DTOs;

public class EvidenceDto
{
    public int EvidenceId { get; set; }
    public int? ComplaintId { get; set; }
    public int? CaseId { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string FileType { get; set; } = string.Empty;
    public long? FileSize { get; set; }
    public string? Description { get; set; }
    public DateTime UploadedAt { get; set; }
    public int? UploadedBy { get; set; }
    public string? UploaderName { get; set; }
    public bool HasFile { get; set; }
}