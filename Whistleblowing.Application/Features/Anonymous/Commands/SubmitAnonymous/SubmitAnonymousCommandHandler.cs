using MediatR;
using Microsoft.EntityFrameworkCore;
using Whistleblowing.Application.Common;
using Whistleblowing.Application.Common.Interfaces;
using Whistleblowing.Domain.Entities;
using Whistleblowing.Domain.Enums;

namespace Whistleblowing.Application.Features.Anonymous.Commands.SubmitAnonymous;

public class SubmitAnonymousCommandHandler
    : IRequestHandler<SubmitAnonymousCommand, SubmitAnonymousResponse>
{
    private const int MaxCodeGenerationAttempts = 5;

    private readonly IApplicationDbContext _context;

    public SubmitAnonymousCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<SubmitAnonymousResponse> Handle(
        SubmitAnonymousCommand request,
        CancellationToken cancellationToken)
    {
        string referenceCode = string.Empty;
        for (int attempt = 0; attempt < MaxCodeGenerationAttempts; attempt++)
        {
            var candidate = ReferenceCodeGenerator.Generate();
            var exists = await _context.Complaints
                .AnyAsync(c => c.ReferenceCode == candidate, cancellationToken);

            if (!exists)
            {
                referenceCode = candidate;
                break;
            }
        }

        if (string.IsNullOrEmpty(referenceCode))
        {
            throw new InvalidOperationException(
                "Failed to generate a unique reference code. Please try again.");
        }

        var now = DateTime.UtcNow;

        var complaint = new Complaint
        {
            Title = request.Title.Trim(),
            Description = request.Description.Trim(),
            Category = request.Category?.Trim(),
            ReferenceCode = referenceCode,
            IsAnonymous = true,
            UserId = null,
            Status = ComplaintStatus.PENDING,
            CreatedAt = now,
            UpdatedAt = now
        };

        _context.Complaints.Add(complaint);
        await _context.SaveChangesAsync(cancellationToken);

        return new SubmitAnonymousResponse
        {
            ComplaintId = complaint.ComplaintId,
            ReferenceCode = complaint.ReferenceCode!,
            SubmittedAt = complaint.CreatedAt
        };
    }
}