using MediatR;
using Microsoft.EntityFrameworkCore;
using Whistleblowing.Application.Common.Interfaces;
using Whistleblowing.Domain.Entities;

namespace Whistleblowing.Application.Features.Evidence.Commands.UploadEvidence;

public class UploadEvidenceCommandHandler : IRequestHandler<UploadEvidenceCommand, int>
{
    private readonly IApplicationDbContext _context;
    private readonly IFileStorageService _fileStorage;
    private readonly ICurrentUserService _currentUser;

    public UploadEvidenceCommandHandler(
        IApplicationDbContext context,
        IFileStorageService fileStorage,
        ICurrentUserService currentUser)
    {
        _context = context;
        _fileStorage = fileStorage;
        _currentUser = currentUser;
    }

    public async Task<int> Handle(UploadEvidenceCommand request, CancellationToken cancellationToken)
    {
        var caseExists = await _context.Cases.AnyAsync(c => c.CaseId == request.CaseId, cancellationToken);
        if (!caseExists)
        {
            return 0; 
        }

        string storedFileName = await _fileStorage.SaveFileAsync(request.FileStream, request.FileName, cancellationToken);

        // ⚠️ මෙතන ප්‍රශ්නය තමයි. අපි domain entity එකට full path එක දෙනවා
        var evidence = new Whistleblowing.Domain.Entities.Evidence
        {
            CaseId = request.CaseId,
            FileName = request.FileName,
            FileType = request.ContentType,
            FilePath = storedFileName,
            FileSize = (int)request.FileSize,
            Description = request.Description,
            UploadedAt = DateTime.UtcNow,
            UploadedBy = _currentUser.UserId
        };

        _context.Evidence.Add(evidence);
        await _context.SaveChangesAsync(cancellationToken);

        return evidence.EvidenceId;
    }
}