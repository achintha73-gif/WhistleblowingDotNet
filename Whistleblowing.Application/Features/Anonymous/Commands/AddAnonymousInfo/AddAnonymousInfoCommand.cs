using MediatR;

namespace Whistleblowing.Application.Features.Anonymous.Commands.AddAnonymousInfo;

public class AddAnonymousInfoCommand : IRequest<AddAnonymousInfoResponse?>
{
    public string ReferenceCode { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}

public class AddAnonymousInfoResponse
{
    public int InfoId { get; set; }
    public DateTime SubmittedAt { get; set; }
}