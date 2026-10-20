using MediatR;
using Microsoft.EntityFrameworkCore;
using Whistleblowing.Application.Common.Interfaces;
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
        if (!_currentUser.IsAuthenticated || _currentUser.UserId == null)
        {
            throw new UnauthorizedAccessException("Authentication required.");
        }

        var complaint = await _context.Complaints
            .FirstOrDefaultAsync(
                c => c.ComplaintId == request.ComplaintId,
                cancellationToken
            );

        if (complaint == null)
        {
            throw new KeyNotFoundException("Complaint not found.");
        }

        var isStaff =
            _currentUser.RoleName == "MANAGER" ||
            _currentUser.RoleName == "INVESTIGATOR" ||
            _currentUser.RoleName == "ADMIN";

        if (!isStaff && complaint.UserId != _currentUser.UserId)
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
            ComplaintId = request.ComplaintId,
            CaseId = null,
            FileName = request.FileName,
            FileType = request.FileType,
            FilePath = storedFileName,
            FileSize = (int?)request.FileSize,
            Description = request.Description,
            UploadedAt = DateTime.UtcNow,
            UploadedBy = _currentUser.UserId.Value
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