using MediatR;
using Microsoft.EntityFrameworkCore;
using Whistleblowing.Application.Common.Interfaces;
using Whistleblowing.Domain.Entities;
using Whistleblowing.Domain.Enums;

namespace Whistleblowing.Application.Features.Cases.Commands.SubmitReport;

public class SubmitReportCommandHandler : IRequestHandler<SubmitReportCommand, int>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public SubmitReportCommandHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<int> Handle(SubmitReportCommand request, CancellationToken cancellationToken)
    {
        var caseEntity = await _context.Cases
            .Include(caseRecord => caseRecord.Complaint)
            .Include(caseRecord => caseRecord.InvestigatorAssignments)
            .FirstOrDefaultAsync(caseRecord => caseRecord.CaseId == request.CaseId, cancellationToken);
        if (caseEntity is null) return 0;

        if (_currentUser.RoleName == "INVESTIGATOR" &&
            caseEntity.AssignedInvestigatorId != _currentUser.UserId &&
            !caseEntity.InvestigatorAssignments.Any(assignment => assignment.InvestigatorId == _currentUser.UserId))
            throw new UnauthorizedAccessException("You can only submit reports for cases assigned to you.");

        var report = new InvestigationReport
        {
            CaseId = request.CaseId,
            Findings = request.Findings,
            Recommendation = request.Recommendation,
            CreatedAt = DateTime.UtcNow
        };

        var managerIds = await _context.Users.Where(u => u.Role.RoleName == "MANAGER" && u.Status == UserStatus.ACTIVE)
            .Select(u => u.UserId).ToListAsync(cancellationToken);
        foreach (var managerId in managerIds)
            _context.Notifications.Add(new Notification { UserId = managerId, Message = $"An investigation report was submitted for Case #{caseEntity.CaseId}.", CreatedAt = DateTime.UtcNow });
        if (!caseEntity.Complaint.IsAnonymous && caseEntity.Complaint.UserId.HasValue)
            _context.Notifications.Add(new Notification { UserId = caseEntity.Complaint.UserId.Value, Message = $"There is an investigation update for your concern (Case #{caseEntity.CaseId}).", CreatedAt = DateTime.UtcNow });

        _context.InvestigationReports.Add(report);
        await _context.SaveChangesAsync(cancellationToken);

        return report.ReportId;
    }
}
