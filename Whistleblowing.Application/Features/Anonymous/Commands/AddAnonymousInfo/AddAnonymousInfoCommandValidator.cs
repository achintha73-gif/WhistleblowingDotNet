using FluentValidation;

namespace Whistleblowing.Application.Features.Anonymous.Commands.AddAnonymousInfo;

public class AddAnonymousInfoCommandValidator : AbstractValidator<AddAnonymousInfoCommand>
{
    public AddAnonymousInfoCommandValidator()
    {
        RuleFor(x => x.ReferenceCode)
            .NotEmpty().WithMessage("Reference code is required.")
            .MaximumLength(20);

        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Title is required.")
            .MaximumLength(200);

        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("Description is required.")
            .MaximumLength(5000);
    }
}