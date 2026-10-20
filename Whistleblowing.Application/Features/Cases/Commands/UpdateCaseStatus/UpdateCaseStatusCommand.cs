using MediatR;
using Whistleblowing.Domain.Enums;
namespace Whistleblowing.Application.Features.Cases.Commands.UpdateCaseStatus;
public class UpdateCaseStatusCommand : IRequest<bool>
{
    public int CaseId { get; set; }
    public CaseStatus NewStatus { get; set; }
}