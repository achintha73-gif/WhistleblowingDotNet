using MediatR;
using Microsoft.EntityFrameworkCore;
using Whistleblowing.Application.Common;
using Whistleblowing.Application.Common.Interfaces;
using Whistleblowing.Domain.Entities;
using Whistleblowing.Domain.Enums;

namespace Whistleblowing.Application.Features.Anonymous.Commands.AddAnonymousInfo;

public class AddAnonymousInfoCommandHandler
    : IRequestHandler<AddAnonymousInfoCommand, AddAnonymousInfoResponse?>
{
    private readonly IApplicationDbContext _context;

    public AddAnonymousInfoCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<AddAnonymousInfoResponse?> Handle(
        AddAnonymousInfoCommand request,
        CancellationToken cancellationToken)
    {
        var normalized = ReferenceCodeGenerator.Normalize(request.ReferenceCode);
        
        // Return null instead of throwing -> Controller will handle 404
        if (!ReferenceCodeGenerator.IsValidFormat(normalized))
        {
            return null; 
        }

        var complaint = await _context.Complaints
            .AsNoTracking()
            .FirstOrDefaultAsync(
                c => c.ReferenceCode == normalized && c.IsAnonymous && c.IsAnonymous,
                cancellationToken);

        if (complaint is null)
        {
            return null;
        }

        var additionalInfo = new AdditionalInformation
        {
            ComplaintId = complaint.ComplaintId,
            Title = request.Title.Trim(),
            Description = request.Description.Trim(),
            InformationType = InformationType.ADDITIONAL_DETAILS,
            SubmittedBy = null,
            SubmittedAt = DateTime.UtcNow
        };

        _context.AdditionalInformations.Add(additionalInfo);
        await _context.SaveChangesAsync(cancellationToken);

        return new AddAnonymousInfoResponse
        {
            InfoId = additionalInfo.InfoId,
            SubmittedAt = additionalInfo.SubmittedAt
        };
    }
}