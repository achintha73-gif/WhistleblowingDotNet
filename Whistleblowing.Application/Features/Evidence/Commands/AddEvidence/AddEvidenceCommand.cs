using MediatR;
using Whistleblowing.Application.Features.Evidence.DTOs;

namespace Whistleblowing.Application.Features.Evidence.Commands.AddEvidence;

public class AddEvidenceCommand : IRequest<EvidenceDto>
{
    public int ComplaintId { get; set; }
    public string? AnonymousReferenceCode { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string FileType { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public string? Description { get; set; }
    public Stream FileStream { get; set; } = Stream.Null;
}
