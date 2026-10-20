using MediatR;
using Microsoft.EntityFrameworkCore;
using Whistleblowing.Application.Common.Interfaces;
using Whistleblowing.Domain.Entities;
using Whistleblowing.Domain.Enums;

namespace Whistleblowing.Application.Features.Cases.Commands.AssignInvestigator;

public class AssignInvestigatorCommandHandler : IRequestHandler<AssignInvestigatorCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public AssignInvestigatorCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(AssignInvestigatorCommand request, CancellationToken cancellationToken)
    {
        var caseEntity = await _context.Cases
            .FirstOrDefaultAsync(c => c.CaseId == request.CaseId, cancellationToken);

        if (caseEntity is null) return false;

        var investigator = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.UserId == request.InvestigatorId, cancellationToken);

        if (investigator is null || investigator.Role?.RoleName.ToString() != "INVESTIGATOR")
        {
            throw new InvalidOperationException("The provided user is not a valid Investigator.");
        }

        // 1. Assign the case
        caseEntity.AssignedInvestigatorId = investigator.UserId;
        caseEntity.UpdatedAt = DateTime.UtcNow;

        // 2. Create Notification
        var notification = new Notification
        {
            UserId = investigator.UserId,
            Message = $"You have been assigned to investigate Case #{caseEntity.CaseId}.",
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        };

        _context.Notifications.Add(notification);

        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
}