using FluentValidation;

namespace Whistleblowing.Application.Features.Cases.Commands.SubmitReport;

public class SubmitReportCommandValidator : AbstractValidator<SubmitReportCommand>
{
    public SubmitReportCommandValidator()
    {
        RuleFor(x => x.CaseId).GreaterThan(0);
        RuleFor(x => x.Findings).NotEmpty().MaximumLength(5000);
        RuleFor(x => x.Recommendation).NotEmpty().MaximumLength(5000);
    }
}