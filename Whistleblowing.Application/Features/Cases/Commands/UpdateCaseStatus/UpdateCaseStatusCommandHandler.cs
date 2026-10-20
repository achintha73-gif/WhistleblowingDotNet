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
        var caseEntity = await _context.Cases.FirstOrDefaultAsync(c => c.CaseId == request.CaseId, cancellationToken);
        if (caseEntity is null) return false;

        caseEntity.Status = request.NewStatus;
        caseEntity.UpdatedAt = DateTime.UtcNow;

        if (request.NewStatus == CaseStatus.CLOSED)
        {
            caseEntity.ClosedAt = DateTime.UtcNow;
        }

        var history = new CaseStatusHistory
        {
            CaseId = caseEntity.CaseId,
            Status = request.NewStatus,
            ChangedBy = _currentUser.UserId ?? 1,
            ChangedAt = DateTime.UtcNow
        };
        _context.CaseStatusHistories.Add(history);

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}