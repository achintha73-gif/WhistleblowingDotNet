using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Whistleblowing.Application.Features.Cases.Commands.AssignInvestigator;
using Whistleblowing.Application.Features.Cases.Commands.ConvertComplaint;
using Whistleblowing.Application.Features.Cases.Commands.UpdateCaseStatus;
using Whistleblowing.Application.Features.Cases.Queries.GetCases;
using Whistleblowing.Domain.Enums;

namespace Whistleblowing.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CasesController : ControllerBase
{
    private readonly IMediator _mediator;

    public CasesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost("convert/{complaintId:int}")]
    [Authorize(Roles = "ADMIN,MANAGER")]
    public async Task<IActionResult> Convert([FromRoute] int complaintId, [FromQuery] CasePriority priority = CasePriority.MEDIUM)
    {
        var command = new ConvertComplaintCommand { ComplaintId = complaintId, Priority = priority };
        var caseId = await _mediator.Send(command);
        if (caseId == 0) return NotFound(new { error = "Complaint not found." });
        return Ok(new { caseId, message = "Complaint successfully converted to case." });
    }

    [HttpPost("{caseId:int}/assign/{investigatorId:int}")]
    [Authorize(Roles = "ADMIN,MANAGER")]
    public async Task<IActionResult> AssignInvestigator([FromRoute] int caseId, [FromRoute] int investigatorId)
    {
        var command = new AssignInvestigatorCommand { CaseId = caseId, InvestigatorId = investigatorId };
        var success = await _mediator.Send(command);
        if (!success) return NotFound(new { error = "Case not found." });
        return Ok(new { message = "Investigator successfully assigned to case." });
    }

    [HttpPut("{caseId:int}/status")]
    [Authorize(Roles = "ADMIN,MANAGER,INVESTIGATOR")]
    public async Task<IActionResult> UpdateStatus([FromRoute] int caseId, [FromQuery] CaseStatus newStatus)
    {
        var command = new UpdateCaseStatusCommand { CaseId = caseId, NewStatus = newStatus };
        var success = await _mediator.Send(command);
        if (!success) return NotFound(new { error = "Case not found." });
        return Ok(new { message = $"Case status updated to {newStatus}." });
    }

    [HttpGet]
    [Authorize(Roles = "ADMIN,MANAGER,INVESTIGATOR")]
    public async Task<IActionResult> GetAll([FromQuery] string? status)
    {
        var query = new GetCasesQuery { Status = status };
        var result = await _mediator.Send(query);
        return Ok(result);
    }
}