using MediatR;
using Microsoft.EntityFrameworkCore;
using Whistleblowing.Application.Common.Interfaces;
using Whistleblowing.Application.Features.Complaints.DTOs;
using Whistleblowing.Domain.Enums;

namespace Whistleblowing.Application.Features.Complaints.Queries.GetComplaints;

public class GetComplaintsQueryHandler
    : IRequestHandler<GetComplaintsQuery, List<ComplaintDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public GetComplaintsQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser
    )
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<List<ComplaintDto>> Handle(
        GetComplaintsQuery request,
        CancellationToken cancellationToken
    )
    {
        if (!_currentUser.IsAuthenticated || _currentUser.UserId == null)
        {
            throw new UnauthorizedAccessException("Authentication required.");
        }

        // Base query
        IQueryable<Whistleblowing.Domain.Entities.Complaint> query = _context.Complaints
            .Include(c => c.User)
            .AsNoTracking();

        // 🔍 Role-based filtering
        if (_currentUser.RoleName == "USER")
        {
            // Employee sees only their own complaints (non-anonymous)
            query = query.Where(c => c.UserId == _currentUser.UserId);
        }
        else if (_currentUser.RoleName == "MANAGER" ||
                 _currentUser.RoleName == "INVESTIGATOR" ||
                 _currentUser.RoleName == "ADMIN")
        {
            // Staff sees all
            // No filter
        }
        else
        {
            throw new UnauthorizedAccessException("Access denied.");
        }

        // Optional status filter
        if (!string.IsNullOrWhiteSpace(request.Status))
        {
            if (Enum.TryParse<ComplaintStatus>(request.Status, true, out var status))
            {
                query = query.Where(c => c.Status == status);
            }
        }

        // Order by newest first
        var complaints = await query
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync(cancellationToken);

        // Map to DTOs
        return complaints.Select(c => new ComplaintDto
        {
            ComplaintId = c.ComplaintId,
            Title = c.Title,
            Description = c.Description,
            Category = c.Category,
            Status = c.Status.ToString(),
            IsAnonymous = c.IsAnonymous,
            CreatedAt = c.CreatedAt,
            UpdatedAt = c.UpdatedAt,
            AuthorId = c.UserId,
            AuthorName = c.IsAnonymous ? null : c.User?.Name,
            AuthorEmail = c.IsAnonymous ? null : c.User?.Email
        }).ToList();
    }
}