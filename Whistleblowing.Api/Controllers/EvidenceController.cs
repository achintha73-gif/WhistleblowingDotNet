using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Whistleblowing.Api.Models;
using Whistleblowing.Application.Features.Evidence.Commands.UploadEvidence;

namespace Whistleblowing.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class EvidenceController : ControllerBase
{
    private readonly IMediator _mediator;

    public EvidenceController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost("case/{caseId:int}/upload")]
    [Authorize(Roles = "ADMIN,MANAGER,INVESTIGATOR")]
    public async Task<IActionResult> UploadToCase(
        [FromRoute] int caseId,
        [FromForm] UploadEvidenceRequest request)
    {
        if (request.File == null || request.File.Length == 0)
            return BadRequest(new { error = "No file uploaded." });

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
}