using MediatR;
using Microsoft.EntityFrameworkCore;
using Whistleblowing.Application.Common.Interfaces;
using Whistleblowing.Domain.Enums;

namespace Whistleblowing.Application.Features.Complaints.Commands.DeleteComplaint;

public class DeleteComplaintCommandHandler
    : IRequestHandler<DeleteComplaintCommand, Unit>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public DeleteComplaintCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser
    )
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Unit> Handle(
        DeleteComplaintCommand request,
        CancellationToken cancellationToken
    )
    {
        // 1. Auth check
        if (!_currentUser.IsAuthenticated || _currentUser.UserId == null)
        {
            throw new UnauthorizedAccessException("Authentication required.");
        }

        // 2. Find complaint
        var complaint = await _context.Complaints
            .FirstOrDefaultAsync(
                c => c.ComplaintId == request.ComplaintId,
                cancellationToken
            );

        if (complaint == null)
        {
            throw new KeyNotFoundException("Complaint not found.");
        }

        // 3. Check if complaint has a case (block deletion)
        if (complaint.Status == ComplaintStatus.CONVERTED_TO_CASE)
        {
            throw new InvalidOperationException(
                "Cannot delete a complaint that has been converted to a case."
            );
        }

        // 4. Role-based authorization
        var role = _currentUser.RoleName;

        if (role == "USER")
        {
            // Employee: only own + PENDING
            if (complaint.UserId != _currentUser.UserId)
            {
                throw new UnauthorizedAccessException(
                    "You can only delete your own complaints."
                );
            }
            if (complaint.Status != ComplaintStatus.PENDING)
            {
                throw new UnauthorizedAccessException(
                    "You can only delete pending complaints."
                );
            }
        }
        else if (role == "MANAGER")
        {
            // Manager: PENDING or REJECTED
            if (complaint.Status != ComplaintStatus.PENDING &&
                complaint.Status != ComplaintStatus.REJECTED)
            {
                throw new UnauthorizedAccessException(
                    "Managers can only delete PENDING or REJECTED complaints."
                );
            }
        }
        else if (role == "ADMIN")
        {
            // Admin: any (except CONVERTED_TO_CASE, already checked)
        }
        else
        {
            // Investigator: never
            throw new UnauthorizedAccessException(
                "Investigators cannot delete complaints."
            );
        }

        // 5. Delete (hard delete)
        // Cascade: evidence + additional_information (via FK config)
        _context.Complaints.Remove(complaint);
        await _context.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}