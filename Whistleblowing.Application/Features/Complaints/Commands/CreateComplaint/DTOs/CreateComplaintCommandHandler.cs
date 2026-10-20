using MediatR;
using Microsoft.EntityFrameworkCore;
using Whistleblowing.Application.Common.Interfaces;
using Whistleblowing.Application.Features.Complaints.DTOs;
using Whistleblowing.Domain.Entities;
using Whistleblowing.Domain.Enums;

namespace Whistleblowing.Application.Features.Complaints.Commands.CreateComplaint;

public class CreateComplaintCommandHandler
    : IRequestHandler<CreateComplaintCommand, ComplaintDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public CreateComplaintCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser
    )
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<ComplaintDto> Handle(
        CreateComplaintCommand request,
        CancellationToken cancellationToken
    )
    {
        // 1. Check user is authenticated
        if (!_currentUser.IsAuthenticated || _currentUser.UserId == null)
        {
            throw new UnauthorizedAccessException("Authentication required.");
        }

        // 2. Check role — only USER (employee) can submit
        if (_currentUser.RoleName != "USER")
        {
            throw new UnauthorizedAccessException(
                "Only employees can submit complaints."
            );
        }

        // 3. Create complaint
        var complaint = new Complaint
        {
            Title = request.Title.Trim(),
            Description = request.Description.Trim(),
            Category = string.IsNullOrWhiteSpace(request.Category)
                ? null
                : request.Category.Trim(),
            Status = ComplaintStatus.PENDING,
            IsAnonymous = request.IsAnonymous,
            UserId = request.IsAnonymous ? null : _currentUser.UserId.Value,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Complaints.Add(complaint);
        await _context.SaveChangesAsync(cancellationToken);

        // 4. Return DTO
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
            AuthorName = null, // optional — can join users table if needed
            AuthorEmail = null
        };
    }
}