using MediatR;

namespace Whistleblowing.Application.Features.Anonymous.Commands.SubmitAnonymous;

public class SubmitAnonymousCommand : IRequest<SubmitAnonymousResponse>
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? Category { get; set; }
}

public class SubmitAnonymousResponse
{
    public int ComplaintId { get; set; }
    public string ReferenceCode { get; set; } = string.Empty;
    public DateTime SubmittedAt { get; set; }
}