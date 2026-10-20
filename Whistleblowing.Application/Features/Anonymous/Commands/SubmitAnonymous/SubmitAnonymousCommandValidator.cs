using FluentValidation;

namespace Whistleblowing.Application.Features.Anonymous.Commands.SubmitAnonymous;

public class SubmitAnonymousCommandValidator : AbstractValidator<SubmitAnonymousCommand>
{
    public SubmitAnonymousCommandValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Title is required.")
            .MaximumLength(200);

        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("Description is required.")
            .MaximumLength(5000);

        RuleFor(x => x.Category)
            .MaximumLength(100)
            .When(x => !string.IsNullOrWhiteSpace(x.Category));
    }
}