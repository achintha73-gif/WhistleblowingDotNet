using FluentValidation;

namespace Whistleblowing.Application.Features.Cases.Commands.ConvertComplaint;

public class ConvertComplaintCommandValidator : AbstractValidator<ConvertComplaintCommand>
{
    public ConvertComplaintCommandValidator()
    {
        RuleFor(x => x.ComplaintId)
            .GreaterThan(0).WithMessage("Invalid Complaint ID.");

        RuleFor(x => x.Priority)
            .IsInEnum().WithMessage("Invalid Case Priority.");
    }
}