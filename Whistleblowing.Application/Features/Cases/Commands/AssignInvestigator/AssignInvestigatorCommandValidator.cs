using FluentValidation;
namespace Whistleblowing.Application.Features.Cases.Commands.AssignInvestigator;
public class AssignInvestigatorCommandValidator : AbstractValidator<AssignInvestigatorCommand>
{
    public AssignInvestigatorCommandValidator()
    {
        RuleFor(x => x.CaseId).GreaterThan(0);
        RuleFor(x => x.InvestigatorId).GreaterThan(0);
    }
}