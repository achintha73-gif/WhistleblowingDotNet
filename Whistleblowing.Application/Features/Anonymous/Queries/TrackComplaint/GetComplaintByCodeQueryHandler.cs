using MediatR;
using Microsoft.EntityFrameworkCore;
using Whistleblowing.Application.Common;
using Whistleblowing.Application.Common.Interfaces;
using Whistleblowing.Application.Features.Anonymous.DTOs;

namespace Whistleblowing.Application.Features.Anonymous.Queries.TrackComplaint;

public class GetComplaintByCodeQueryHandler
    : IRequestHandler<GetComplaintByCodeQuery, TrackComplaintDto?>
{
    private readonly IApplicationDbContext _context;

    public GetComplaintByCodeQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<TrackComplaintDto?> Handle(
        GetComplaintByCodeQuery request,
        CancellationToken cancellationToken)
    {
        // 1. Normalize + early-format check (no DB call if invalid)
        var normalized = ReferenceCodeGenerator.Normalize(request.ReferenceCode);
        if (!ReferenceCodeGenerator.IsValidFormat(normalized))
        {
            return null;
        }

        // 2. Lookup + project to safe DTO only
        var complaint = await _context.Complaints
            .AsNoTracking()
            .Where(c => c.ReferenceCode == normalized && c.IsAnonymous)
            .Select(c => new TrackComplaintDto
            {
                ReferenceCode = c.ReferenceCode!,
                Title = c.Title,
                Description = c.Description,
                Category = c.Category,
                Status = c.Status.ToString(),
                SubmittedAt = c.CreatedAt,
                LastUpdatedAt = c.UpdatedAt
            })
            .FirstOrDefaultAsync(cancellationToken);

        return complaint;
    }
}