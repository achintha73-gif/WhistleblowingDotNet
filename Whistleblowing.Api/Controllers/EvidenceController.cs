using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Whistleblowing.Api.Models;
using Whistleblowing.Application.Features.Evidence.Commands.UploadEvidence;
using Whistleblowing.Application.Features.Evidence.Commands.AddEvidence;
using Whistleblowing.Application.Common;
using Whistleblowing.Application.Common.Interfaces;

namespace Whistleblowing.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class EvidenceController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IApplicationDbContext _context;
    private readonly IFileStorageService _fileStorage;
    private readonly ICurrentUserService _currentUser;

    public EvidenceController(IMediator mediator, IApplicationDbContext context, IFileStorageService fileStorage, ICurrentUserService currentUser)
    {
        _mediator = mediator;
        _context = context;
        _fileStorage = fileStorage;
        _currentUser = currentUser;
    }

    [HttpGet("{evidenceId:int}/download")]
    public async Task<IActionResult> Download(int evidenceId, CancellationToken cancellationToken)
    {
        var evidence = await _context.Evidence
            .Include(item => item.Complaint)
                .ThenInclude(complaint => complaint!.Case)
                    .ThenInclude(caseRecord => caseRecord!.InvestigatorAssignments)
            .Include(item => item.Case)
                .ThenInclude(caseRecord => caseRecord!.InvestigatorAssignments)
            .FirstOrDefaultAsync(item => item.EvidenceId == evidenceId, cancellationToken);
        if (evidence is null || string.IsNullOrWhiteSpace(evidence.FilePath))
            return NotFound(new { error = "Evidence file not found." });

        var isAdminOrManager = _currentUser.RoleName is "ADMIN" or "MANAGER";
        var isOwner = _currentUser.RoleName == "USER" && evidence.Complaint?.UserId == _currentUser.UserId;
        var isAssignedInvestigator = _currentUser.RoleName == "INVESTIGATOR" &&
            (evidence.Case?.AssignedInvestigatorId == _currentUser.UserId ||
             evidence.Case?.InvestigatorAssignments.Any(assignment => assignment.InvestigatorId == _currentUser.UserId) == true ||
             evidence.Complaint?.Case?.AssignedInvestigatorId == _currentUser.UserId ||
             evidence.Complaint?.Case?.InvestigatorAssignments.Any(assignment => assignment.InvestigatorId == _currentUser.UserId) == true);
        if (!isAdminOrManager && !isOwner && !isAssignedInvestigator)
            return Forbid();

        var stream = await _fileStorage.GetFileAsync(evidence.FilePath, cancellationToken);
        if (stream is null) return NotFound(new { error = "The stored evidence file is unavailable." });
        return File(stream, string.IsNullOrWhiteSpace(evidence.FileType) ? "application/octet-stream" : evidence.FileType, Path.GetFileName(evidence.FileName));
    }

    [HttpPost("case/{caseId:int}/upload")]
    [Authorize(Roles = "ADMIN,MANAGER,INVESTIGATOR")]
    [RequestSizeLimit(11 * 1024 * 1024)]
    public async Task<IActionResult> UploadToCase(
        [FromRoute] int caseId,
        [FromForm] UploadEvidenceRequest request,
        CancellationToken cancellationToken)
    {
        if (_currentUser.RoleName == "INVESTIGATOR")
        {
            var isAssigned = await _context.Cases
                .Where(caseRecord => caseRecord.CaseId == caseId)
                .AnyAsync(caseRecord => caseRecord.AssignedInvestigatorId == _currentUser.UserId ||
                    caseRecord.InvestigatorAssignments.Any(assignment => assignment.InvestigatorId == _currentUser.UserId), cancellationToken);
            if (!isAssigned) return Forbid();
        }

        if (request.File == null || request.File.Length == 0)
            return BadRequest(new { error = "No file uploaded." });

        if (request.File.Length > 10 * 1024 * 1024)
            return BadRequest(new { error = "Each file must be 10 MB or smaller." });

        var extension = Path.GetExtension(request.File.FileName).ToLowerInvariant();
        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp", ".txt", ".pdf" };
        if (!allowedExtensions.Contains(extension))
            return BadRequest(new { error = "Only image files, PDF, and TXT files are supported." });

        var command = new UploadEvidenceCommand
        {
            CaseId = caseId,
            FileName = request.File.FileName,
            ContentType = request.File.ContentType,
            FileSize = request.File.Length,
            FileStream = request.File.OpenReadStream(),
            Description = request.Description
        };

        var evidenceId = await _mediator.Send(command);

        if (evidenceId == 0)
        {
            return NotFound(new { error = "Case not found." });
        }

        return Ok(new { evidenceId, message = "Evidence uploaded successfully." });
    }

    [HttpPost("complaint/{complaintId:int}/upload")]
    [Authorize(Roles = "USER,ADMIN,MANAGER,INVESTIGATOR")]
    [RequestSizeLimit(11 * 1024 * 1024)]
    public async Task<IActionResult> UploadToComplaint(
        [FromRoute] int complaintId,
        [FromForm] UploadEvidenceRequest request,
        CancellationToken cancellationToken)
    {
        if (request.File is null || request.File.Length == 0)
            return BadRequest(new { error = "Choose a file to upload." });

        if (request.File.Length > 10 * 1024 * 1024)
            return BadRequest(new { error = "Each file must be 10 MB or smaller." });

        var extension = Path.GetExtension(request.File.FileName).ToLowerInvariant();
        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp", ".txt", ".pdf" };
        if (!allowedExtensions.Contains(extension))
            return BadRequest(new { error = "Only image files, PDF, and TXT files are supported." });

        await using var stream = request.File.OpenReadStream();
        var result = await _mediator.Send(new AddEvidenceCommand
        {
            ComplaintId = complaintId,
            FileName = Path.GetFileName(request.File.FileName.Replace('\\', '/')),
            FileType = request.File.ContentType,
            FileSize = request.File.Length,
            FileStream = stream,
            Description = request.Description
        }, cancellationToken);

        return Ok(new { evidenceId = result.EvidenceId, message = "Evidence uploaded successfully." });
    }

    [HttpPost("anonymous/{referenceCode}/upload")]
    [AllowAnonymous]
    [RequestSizeLimit(11 * 1024 * 1024)]
    public async Task<IActionResult> UploadToAnonymousComplaint(
        [FromRoute] string referenceCode,
        [FromForm] UploadEvidenceRequest request,
        CancellationToken cancellationToken)
    {
        var normalizedCode = ReferenceCodeGenerator.Normalize(referenceCode);
        if (!ReferenceCodeGenerator.IsValidFormat(normalizedCode))
            return NotFound(new { error = "Invalid reference code." });

        if (request.File is null || request.File.Length == 0)
            return BadRequest(new { error = "Choose a file to upload." });

        if (request.File.Length > 10 * 1024 * 1024)
            return BadRequest(new { error = "Each file must be 10 MB or smaller." });

        var extension = Path.GetExtension(request.File.FileName).ToLowerInvariant();
        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp", ".txt", ".pdf" };
        if (!allowedExtensions.Contains(extension))
            return BadRequest(new { error = "Only image files, PDF, and TXT files are supported." });

        await using var stream = request.File.OpenReadStream();
        var result = await _mediator.Send(new AddEvidenceCommand
        {
            AnonymousReferenceCode = normalizedCode,
            FileName = Path.GetFileName(request.File.FileName.Replace('\\', '/')),
            FileType = request.File.ContentType,
            FileSize = request.File.Length,
            FileStream = stream,
            Description = request.Description
        }, cancellationToken);

        return Ok(new { evidenceId = result.EvidenceId, message = "Evidence uploaded successfully." });
    }
}
