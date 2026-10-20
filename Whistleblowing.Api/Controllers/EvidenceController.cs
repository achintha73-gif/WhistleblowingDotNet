using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Whistleblowing.Application.Common.Interfaces;
using Whistleblowing.Application.Features.Evidence.Commands.AddEvidence;
using Whistleblowing.Application.Features.Evidence.DTOs;

namespace Whistleblowing.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EvidenceController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IFileStorageService _fileStorage;
    private readonly IApplicationDbContext _context;

    public EvidenceController(
        IMediator mediator,
        IFileStorageService fileStorage,
        IApplicationDbContext context
    )
    {
        _mediator = mediator;
        _fileStorage = fileStorage;
        _context = context;
    }

    [HttpPost("complaints/{complaintId:int}/upload")]
    [Authorize]
    [RequestSizeLimit(5 * 1024 * 1024)]
    public async Task<IActionResult> Upload(
    int complaintId,
    IFormFile file,                     
    string? description                 
)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(new { error = "File is required." });
        }

        var allowedExtensions = new[]
        {
            ".pdf", ".doc", ".docx", ".txt", ".csv", ".xlsx",
            ".jpg", ".jpeg", ".png", ".gif", ".webp",
            ".mp4", ".webm", ".mov"
        };

        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!allowedExtensions.Contains(ext))
        {
            return BadRequest(new
            {
                error = $"File type '{ext}' is not allowed."
            });
        }

        await using var stream = file.OpenReadStream();

        var command = new AddEvidenceCommand
        {
            ComplaintId = complaintId,
            FileName = file.FileName,
            FileType = file.ContentType,
            FileSize = file.Length,
            Description = description,
            FileStream = stream
        };

        var result = await _mediator.Send(command);
        return CreatedAtAction(nameof(Download), new { id = result.EvidenceId }, result);
    }

    [HttpGet("{id:int}/download")]
    [Authorize]
    public async Task<IActionResult> Download(int id)
    {
        var evidence = _context.Evidence
            .FirstOrDefault(e => e.EvidenceId == id);

        if (evidence == null || string.IsNullOrEmpty(evidence.FilePath))
        {
            return NotFound(new { error = "Evidence not found." });
        }

        var stream = await _fileStorage.GetFileAsync(evidence.FilePath);
        if (stream == null)
        {
            return NotFound(new { error = "File not found on disk." });
        }

        return File(stream, evidence.FileType, evidence.FileName);
    }
}