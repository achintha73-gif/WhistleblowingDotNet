using MediatR;
using Microsoft.EntityFrameworkCore;
using Whistleblowing.Application.Common.Interfaces;
using Whistleblowing.Domain.Entities;
using Whistleblowing.Domain.Enums;

namespace Whistleblowing.Application.Features.Cases.Commands.UpdateCaseStatus;

public class UpdateCaseStatusCommandHandler : IRequestHandler<UpdateCaseStatusCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public UpdateCaseStatusCommandHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<bool> Handle(UpdateCaseStatusCommand request, CancellationToken cancellationToken)
    {
        var caseEntity = await _context.Cases
            .Include(c => c.Complaint)
            .Include(c => c.InvestigatorAssignments)
            .FirstOrDefaultAsync(c => c.CaseId == request.CaseId, cancellationToken);
        if (caseEntity is null) return false;

        var previousStatus = caseEntity.Status;
        var isAssignedInvestigator = caseEntity.AssignedInvestigatorId == _currentUser.UserId ||
            caseEntity.InvestigatorAssignments.Any(assignment => assignment.InvestigatorId == _currentUser.UserId);
        if (_currentUser.RoleName == "INVESTIGATOR" && !isAssignedInvestigator)
            throw new UnauthorizedAccessException("You can only update the status of cases assigned to you.");

        caseEntity.Status = request.NewStatus;
        caseEntity.UpdatedAt = DateTime.UtcNow;

        if (request.NewStatus == CaseStatus.CLOSED)
        {
            caseEntity.ClosedAt = DateTime.UtcNow;
        }
        else if (previousStatus == CaseStatus.CLOSED)
        {
            caseEntity.ClosedAt = null;
        }

        var history = new CaseStatusHistory
        {
            CaseId = caseEntity.CaseId,
            Status = request.NewStatus,
            ChangedBy = _currentUser.UserId ?? 1,
            ChangedAt = DateTime.UtcNow
        };
        _context.CaseStatusHistories.Add(history);

        if (previousStatus != request.NewStatus && !caseEntity.Complaint.IsAnonymous && caseEntity.Complaint.UserId.HasValue)
        {
            var statusMessage = request.NewStatus == CaseStatus.CLOSED
                ? $"The investigation for your concern (Case #{caseEntity.CaseId}) has been closed."
                : request.NewStatus == CaseStatus.INVESTIGATING
                    ? $"Investigation has started for your concern (Case #{caseEntity.CaseId})."
                    : $"Your concern's case (#{caseEntity.CaseId}) status changed to {request.NewStatus.ToString().Replace('_', ' ')}.";
            _context.Notifications.Add(new Notification { UserId = caseEntity.Complaint.UserId.Value, Message = statusMessage, CreatedAt = DateTime.UtcNow });
        }

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
