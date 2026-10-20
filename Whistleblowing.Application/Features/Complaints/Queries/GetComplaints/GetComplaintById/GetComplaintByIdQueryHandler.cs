using MediatR;
using Microsoft.EntityFrameworkCore;
using Whistleblowing.Application.Common.Interfaces;
using Whistleblowing.Application.Features.Complaints.DTOs;

namespace Whistleblowing.Application.Features.Complaints.Queries.GetComplaintById;

public class GetComplaintByIdQueryHandler
    : IRequestHandler<GetComplaintByIdQuery, ComplaintDto?>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public GetComplaintByIdQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser
    )
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<ComplaintDto?> Handle(
        GetComplaintByIdQuery request,
        CancellationToken cancellationToken
    )
    {
        if (!_currentUser.IsAuthenticated || _currentUser.UserId == null)
        {
            throw new UnauthorizedAccessException("Authentication required.");
        }

        var complaint = await _context.Complaints
            .Include(c => c.User)
            .AsNoTracking()
            .FirstOrDefaultAsync(
                c => c.ComplaintId == request.ComplaintId,
                cancellationToken
            );

        if (complaint == null)
        {
            return null;
        }

        // Access control
        var isStaff =
            _currentUser.RoleName == "MANAGER" ||
            _currentUser.RoleName == "INVESTIGATOR" ||
            _currentUser.RoleName == "ADMIN";

        if (!isStaff && complaint.UserId != _currentUser.UserId)
        {
            // Employee can only see their own complaints
            return null;
        }

        return new ComplaintDto
        {
            ComplaintId = complaint.ComplaintId,
            Title = complaint.Title,
            Description = complaint.Description,
            Category = complaint.Category,
            Status = complaint.Status.ToString(),
            IsAnonymous = complaint.IsAnonymous,
            CreatedAt = complaint.CreatedAt,
            UpdatedAt = complaint.UpdatedAt,
            AuthorId = complaint.UserId,
            AuthorName = complaint.IsAnonymous ? null : complaint.User?.Name,
            AuthorEmail = complaint.IsAnonymous ? null : complaint.User?.Email
        };
    }
}