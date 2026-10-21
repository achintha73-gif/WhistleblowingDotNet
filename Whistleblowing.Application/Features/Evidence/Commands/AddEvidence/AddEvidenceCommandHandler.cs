using MediatR;
using Microsoft.EntityFrameworkCore;
using Whistleblowing.Application.Common.Interfaces;
using Whistleblowing.Application.Common;
using Whistleblowing.Application.Features.Evidence.DTOs;
using EvidenceEntity = Whistleblowing.Domain.Entities.Evidence;

namespace Whistleblowing.Application.Features.Evidence.Commands.AddEvidence;

public class AddEvidenceCommandHandler
    : IRequestHandler<AddEvidenceCommand, EvidenceDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly IFileStorageService _fileStorage;

    public AddEvidenceCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser,
        IFileStorageService fileStorage
    )
    {
        _context = context;
        _currentUser = currentUser;
        _fileStorage = fileStorage;
    }

    public async Task<EvidenceDto> Handle(
        AddEvidenceCommand request,
        CancellationToken cancellationToken
    )
    {
        var complaint = await _context.Complaints
            .FirstOrDefaultAsync(c =>
                request.ComplaintId > 0
                    ? c.ComplaintId == request.ComplaintId
                    : c.IsAnonymous && c.ReferenceCode == ReferenceCodeGenerator.Normalize(request.AnonymousReferenceCode ?? string.Empty),
                cancellationToken
            );

        if (complaint == null)
        {
            throw new KeyNotFoundException("Complaint not found.");
        }

        var anonymousCodeMatches = !string.IsNullOrWhiteSpace(request.AnonymousReferenceCode)
            && complaint.IsAnonymous
            && complaint.ReferenceCode == ReferenceCodeGenerator.Normalize(request.AnonymousReferenceCode);

        if (!anonymousCodeMatches && (!_currentUser.IsAuthenticated || _currentUser.UserId == null))
        {
            throw new UnauthorizedAccessException("Authentication required.");
        }

        if (anonymousCodeMatches)
        {
            var existingEvidence = await _context.Evidence
                .Where(e => e.ComplaintId == complaint.ComplaintId)
                .Select(e => e.FileSize ?? 0)
                .ToListAsync(cancellationToken);

            if (existingEvidence.Count >= 5)
                throw new InvalidOperationException("A report can have up to 5 evidence files.");

            if (existingEvidence.Sum() + request.FileSize > 25L * 1024 * 1024)
                throw new InvalidOperationException("The total evidence size cannot exceed 25 MB.");
        }

        var isStaff =
            _currentUser.RoleName == "MANAGER" ||
            _currentUser.RoleName == "INVESTIGATOR" ||
            _currentUser.RoleName == "ADMIN";

        if (!anonymousCodeMatches && !isStaff && complaint.UserId == _currentUser.UserId)
        {
            var existingEvidence = await _context.Evidence
                .Where(e => e.ComplaintId == complaint.ComplaintId)
                .Select(e => e.FileSize ?? 0)
                .ToListAsync(cancellationToken);

            if (existingEvidence.Count >= 5)
                throw new InvalidOperationException("A concern can have up to 5 evidence files.");

            if (existingEvidence.Sum() + request.FileSize > 25L * 1024 * 1024)
                throw new InvalidOperationException("The total evidence size cannot exceed 25 MB.");
        }

        if (!anonymousCodeMatches && !isStaff && complaint.UserId != _currentUser.UserId)
        {
            throw new UnauthorizedAccessException(
                "You can only attach evidence to your own complaints."
            );
        }

        var storedFileName = await _fileStorage.SaveFileAsync(
            request.FileStream,
            request.FileName,
            cancellationToken
        );

        var evidence = new EvidenceEntity
        {
            ComplaintId = complaint.ComplaintId,
            CaseId = null,
            FileName = request.FileName,
            FileType = request.FileType,
            FilePath = storedFileName,
            FileSize = (int?)request.FileSize,
            Description = request.Description,
            UploadedAt = DateTime.UtcNow,
            UploadedBy = anonymousCodeMatches ? null : _currentUser.UserId
        };

        _context.Evidence.Add(evidence);
        await _context.SaveChangesAsync(cancellationToken);

        return new EvidenceDto
        {
            EvidenceId = evidence.EvidenceId,
            ComplaintId = evidence.ComplaintId,
            CaseId = evidence.CaseId,
            FileName = evidence.FileName,
            FileType = evidence.FileType,
            FileSize = evidence.FileSize,
            Description = evidence.Description,
            UploadedAt = evidence.UploadedAt,
            UploadedBy = evidence.UploadedBy,
            HasFile = true
        };
    }
}
