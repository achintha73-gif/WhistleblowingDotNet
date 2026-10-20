using MediatR;

namespace Whistleblowing.Application.Features.Cases.Commands.SubmitReport;

public class SubmitReportCommand : IRequest<int>
{
    public int CaseId { get; set; }
    public string Findings { get; set; } = string.Empty;
    public string Recommendation { get; set; } = string.Empty;
}