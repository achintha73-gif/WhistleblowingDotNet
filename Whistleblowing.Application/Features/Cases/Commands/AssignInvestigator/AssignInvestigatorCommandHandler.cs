using MediatR;
using Microsoft.EntityFrameworkCore;
using Whistleblowing.Application.Common.Interfaces;
using Whistleblowing.Domain.Entities;
using Whistleblowing.Domain.Enums;

namespace Whistleblowing.Application.Features.Cases.Commands.AssignInvestigator;

public class AssignInvestigatorCommandHandler : IRequestHandler<AssignInvestigatorCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public AssignInvestigatorCommandHandler(IApplicationDbContext context) => _context = context;

    public async Task<bool> Handle(AssignInvestigatorCommand request, CancellationToken cancellationToken)
    {
        var selectedIds = request.InvestigatorIds.Distinct().ToList();
        if (selectedIds.Count == 0)
            throw new InvalidOperationException("Select at least one investigator.");

        var caseEntity = await _context.Cases
            .Include(caseRecord => caseRecord.Complaint)
            .Include(caseRecord => caseRecord.InvestigatorAssignments)
            .FirstOrDefaultAsync(caseRecord => caseRecord.CaseId == request.CaseId, cancellationToken);

        if (caseEntity is null) return false;

        var investigators = await _context.Users
            .Include(user => user.Role)
            .Where(user => selectedIds.Contains(user.UserId))
            .ToListAsync(cancellationToken);

        if (investigators.Count != selectedIds.Count || investigators.Any(user =>
                user.Status != UserStatus.ACTIVE || user.Role?.RoleName != "INVESTIGATOR"))
            throw new InvalidOperationException("One or more selected accounts are not active investigators.");

        var previousIds = caseEntity.InvestigatorAssignments
            .Select(assignment => assignment.InvestigatorId)
            .ToHashSet();
        if (caseEntity.AssignedInvestigatorId.HasValue)
            previousIds.Add(caseEntity.AssignedInvestigatorId.Value);

        var selectedSet = selectedIds.ToHashSet();
        var addedIds = selectedSet.Except(previousIds).ToHashSet();
        var removedIds = previousIds.Except(selectedSet).ToHashSet();

        foreach (var assignment in caseEntity.InvestigatorAssignments
                     .Where(assignment => !selectedSet.Contains(assignment.InvestigatorId)).ToList())
            _context.CaseInvestigators.Remove(assignment);

        foreach (var investigatorId in selectedIds.Where(id => !caseEntity.InvestigatorAssignments
                     .Any(assignment => assignment.InvestigatorId == id)))
            _context.CaseInvestigators.Add(new CaseInvestigator
            {
                CaseId = caseEntity.CaseId,
                InvestigatorId = investigatorId
            });

        caseEntity.AssignedInvestigatorId = selectedIds[0];
        caseEntity.UpdatedAt = DateTime.UtcNow;

        foreach (var investigatorId in addedIds)
            _context.Notifications.Add(new Notification
            {
                UserId = investigatorId,
                Message = $"You have been assigned to investigate Case #{caseEntity.CaseId}.",
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            });

        foreach (var investigatorId in removedIds.Where(id => id != caseEntity.AssignedInvestigatorId))
            _context.Notifications.Add(new Notification
            {
                UserId = investigatorId,
                Message = $"You are no longer assigned to Case #{caseEntity.CaseId}.",
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            });

        if (addedIds.Count > 0 && !caseEntity.Complaint.IsAnonymous && caseEntity.Complaint.UserId.HasValue)
            _context.Notifications.Add(new Notification
            {
                UserId = caseEntity.Complaint.UserId.Value,
                Message = $"Investigator(s) have been assigned to Case #{caseEntity.CaseId} for your concern.",
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            });

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
