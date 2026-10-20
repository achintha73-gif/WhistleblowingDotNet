using MediatR;

namespace Whistleblowing.Application.Features.Evidence.Commands.UploadEvidence;

public class UploadEvidenceCommand : IRequest<int>
{
    public int CaseId { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public Stream FileStream { get; set; } = Stream.Null;
    public string? Description { get; set; }
}