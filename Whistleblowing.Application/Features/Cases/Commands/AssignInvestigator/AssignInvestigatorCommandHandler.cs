using MediatR;
using Microsoft.EntityFrameworkCore;
using Whistleblowing.Application.Common.Interfaces;
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
        var caseEntity = await _context.Cases.FirstOrDefaultAsync(c => c.CaseId == request.CaseId, cancellationToken);
        if (caseEntity is null) return false;

        var investigator = await _context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.UserId == request.InvestigatorId, cancellationToken);
        
        if (investigator is null)
        {
            throw new InvalidOperationException("User not found.");
        }

        // Role එක String එකක් හෝ Enum එකක් වෙන්න පුළුවන් නිසා ToString() දාලා බලමු
        if (investigator.Role?.RoleName.ToString() != "INVESTIGATOR")
        {
            throw new InvalidOperationException("The provided user is not a valid Investigator.");
        }

        caseEntity.AssignedInvestigatorId = investigator.UserId;
        caseEntity.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}