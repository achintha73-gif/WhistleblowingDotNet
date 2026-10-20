using FluentValidation;

namespace Whistleblowing.Application.Features.Complaints.Commands.CreateComplaint;

public class CreateComplaintCommandValidator : AbstractValidator<CreateComplaintCommand>
{
    public CreateComplaintCommandValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Title is required.")
            .MinimumLength(5).WithMessage("Title must be at least 5 characters.")
            .MaximumLength(200).WithMessage("Title is too long (max 200).");

        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("Description is required.")
            .MinimumLength(20).WithMessage("Description must be at least 20 characters.")
            .MaximumLength(5000).WithMessage("Description is too long (max 5000).");

        RuleFor(x => x.Category)
            .MaximumLength(100).WithMessage("Category is too long (max 100).")
            .When(x => !string.IsNullOrWhiteSpace(x.Category));
    }
}