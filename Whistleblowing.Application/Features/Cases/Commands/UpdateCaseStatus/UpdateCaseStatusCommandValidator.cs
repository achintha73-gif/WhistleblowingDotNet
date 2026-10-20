using FluentValidation;
using Whistleblowing.Domain.Enums;
namespace Whistleblowing.Application.Features.Cases.Commands.UpdateCaseStatus;
public class UpdateCaseStatusCommandValidator : AbstractValidator<UpdateCaseStatusCommand>
{
    public UpdateCaseStatusCommandValidator()
    {
        RuleFor(x => x.CaseId).GreaterThan(0);
        RuleFor(x => x.NewStatus).IsInEnum();
    }
}