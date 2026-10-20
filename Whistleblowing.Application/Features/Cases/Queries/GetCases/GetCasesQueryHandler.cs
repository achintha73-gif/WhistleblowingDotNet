using MediatR;
using Microsoft.EntityFrameworkCore;
using Whistleblowing.Application.Common.Interfaces;
using Whistleblowing.Application.Features.Cases.DTOs;
using Whistleblowing.Domain.Enums;

namespace Whistleblowing.Application.Features.Cases.Queries.GetCases;

public class GetCasesQueryHandler : IRequestHandler<GetCasesQuery, List<CaseDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public GetCasesQueryHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<List<CaseDto>> Handle(GetCasesQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Cases
            .Include(c => c.Complaint)
            .Include(c => c.AssignedInvestigator)
            .AsNoTracking()
            .AsQueryable();

        // Role-based filtering
        if (_currentUser.Role == "INVESTIGATOR")
        {
            query = query.Where(c => c.AssignedInvestigatorId == _currentUser.UserId);
        }

        // Optional status filter
        if (!string.IsNullOrEmpty(request.Status) && Enum.TryParse<CaseStatus>(request.Status, true, out var statusEnum))
        {
            query = query.Where(c => c.Status == statusEnum);
        }

        var cases = await query
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => new CaseDto
            {
                CaseId = c.CaseId,
                ComplaintId = c.ComplaintId,
                ComplaintTitle = c.Complaint.Title,
                Status = c.Status,
                Priority = c.Priority,
                AssignedInvestigatorId = c.AssignedInvestigatorId,
                InvestigatorName = c.AssignedInvestigator != null ? c.AssignedInvestigator.Name : null,
                CreatedAt = c.CreatedAt,
                UpdatedAt = c.UpdatedAt
            })
            .ToListAsync(cancellationToken);

        return cases;
    }
}