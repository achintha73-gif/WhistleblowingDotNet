using MediatR;
namespace Whistleblowing.Application.Features.Cases.Commands.AssignInvestigator;
public class AssignInvestigatorCommand : IRequest<bool>
{
    public int CaseId { get; set; }
    public List<int> InvestigatorIds { get; set; } = new();
}
