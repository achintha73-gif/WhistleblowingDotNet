using MediatR;
using Microsoft.EntityFrameworkCore;
using Whistleblowing.Application.Common.Interfaces;
using Whistleblowing.Domain.Entities;
using Whistleblowing.Domain.Enums;

namespace Whistleblowing.Application.Features.Cases.Commands.ConvertComplaint;

public class ConvertComplaintCommandHandler : IRequestHandler<ConvertComplaintCommand, int>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public ConvertComplaintCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<int> Handle(ConvertComplaintCommand request, CancellationToken cancellationToken)
    {
        var complaint = await _context.Complaints
            .FirstOrDefaultAsync(c => c.ComplaintId == request.ComplaintId, cancellationToken);

        if (complaint is null)
        {
            return 0; // Controller will handle 404
        }

        if (complaint.Status == ComplaintStatus.CONVERTED_TO_CASE)
        {
            throw new InvalidOperationException("This complaint has already been converted to a case.");
        }

        var newCase = new Case
        {
            ComplaintId = complaint.ComplaintId,
            Priority = request.Priority,
            Status = CaseStatus.OPEN,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Cases.Add(newCase);

        // Update complaint status
        complaint.Status = ComplaintStatus.CONVERTED_TO_CASE;
        complaint.UpdatedAt = DateTime.UtcNow;

        if (!complaint.IsAnonymous && complaint.UserId.HasValue)
        {
            _context.Notifications.Add(new Notification
            {
                UserId = complaint.UserId.Value,
                Message = $"Your concern \"{complaint.Title}\" has moved into the investigation stage.",
                CreatedAt = DateTime.UtcNow
            });
        }

        // Add to Status History
        var statusHistory = new CaseStatusHistory
        {
            Case = newCase,
            Status = CaseStatus.OPEN,
            ChangedBy = _currentUser.UserId ?? 1,
            ChangedAt = DateTime.UtcNow
        };
        _context.CaseStatusHistories.Add(statusHistory);

        await _context.SaveChangesAsync(cancellationToken);

        return newCase.CaseId;
    }
}
