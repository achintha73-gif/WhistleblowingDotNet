using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Whistleblowing.Application.Common.Interfaces;
using Whistleblowing.Application.Features.Cases.Commands.AssignInvestigator;
using Whistleblowing.Application.Features.Cases.Commands.ConvertComplaint;
using Whistleblowing.Application.Features.Cases.Commands.SubmitReport;
using Whistleblowing.Application.Features.Cases.Commands.UpdateCaseStatus;
using Whistleblowing.Application.Features.Cases.Queries.GetCases;
using Whistleblowing.Domain.Enums;
using Whistleblowing.Api.Models.Cases;

namespace Whistleblowing.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CasesController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IApplicationDbContext _context;

    public CasesController(IMediator mediator, IApplicationDbContext context)
    {
        _mediator = mediator;
        _context = context;
    }

    [HttpGet("investigators")]
    [Authorize(Roles = "ADMIN,MANAGER")]
    public async Task<IActionResult> GetInvestigators(CancellationToken cancellationToken)
    {
        var investigators = await _context.Users.Where(user => user.Role.RoleName == "INVESTIGATOR" && user.Status == Whistleblowing.Domain.Enums.UserStatus.ACTIVE)
            .OrderBy(user => user.Name).Select(user => new
            {
                user.UserId,
                user.Name,
                user.Email,
                DepartmentName = user.Department == null ? null : user.Department.DepartmentName
            }).ToListAsync(cancellationToken);
        return Ok(investigators);
    }

    [HttpGet]
    [Authorize(Roles = "ADMIN,MANAGER,INVESTIGATOR")]
    public async Task<IActionResult> GetAll([FromQuery] string? status)
    {
        var query = new GetCasesQuery { Status = status };
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpPost("convert/{complaintId:int}")]
    [Authorize(Roles = "ADMIN,MANAGER")]
    public async Task<IActionResult> Convert(
        [FromRoute] int complaintId,
        [FromQuery] CasePriority priority = CasePriority.MEDIUM)
    {
        var command = new ConvertComplaintCommand { ComplaintId = complaintId, Priority = priority };
        var caseId = await _mediator.Send(command);
        if (caseId == 0) return NotFound(new { error = "Complaint not found." });
        return Ok(new { caseId, message = "Complaint successfully converted to case." });
    }

    [HttpPost("{caseId:int}/assign/{investigatorId:int}")]
    [Authorize(Roles = "ADMIN,MANAGER")]
    public async Task<IActionResult> AssignInvestigator(
        [FromRoute] int caseId,
        [FromRoute] int investigatorId)
    {
        var command = new AssignInvestigatorCommand { CaseId = caseId, InvestigatorIds = new List<int> { investigatorId } };
        var success = await _mediator.Send(command);
        if (!success) return NotFound(new { error = "Case not found." });
        return Ok(new { message = "Investigator successfully assigned." });
    }

    [HttpPost("{caseId:int}/assignments")]
    [Authorize(Roles = "ADMIN,MANAGER")]
    public async Task<IActionResult> AssignInvestigators(
        [FromRoute] int caseId,
        [FromBody] AssignInvestigatorsRequest request,
        CancellationToken cancellationToken)
    {
        if (request?.InvestigatorIds is null || request.InvestigatorIds.Count == 0)
            return BadRequest(new { error = "Select at least one investigator." });

        var command = new AssignInvestigatorCommand
        {
            CaseId = caseId,
            InvestigatorIds = request.InvestigatorIds
        };
        var success = await _mediator.Send(command, cancellationToken);
        if (!success) return NotFound(new { error = "Case not found." });
        return Ok(new { message = "Investigators successfully assigned." });
    }

    [HttpPut("{caseId:int}/status")]
    [Authorize(Roles = "ADMIN,MANAGER,INVESTIGATOR")]
    public async Task<IActionResult> UpdateStatus(
        [FromRoute] int caseId,
        [FromQuery] CaseStatus newStatus)
    {
        var command = new UpdateCaseStatusCommand { CaseId = caseId, NewStatus = newStatus };
        var success = await _mediator.Send(command);
        if (!success) return NotFound(new { error = "Case not found." });
        return Ok(new { message = $"Case status updated to {newStatus}." });
    }

    [HttpPost("{caseId:int}/report")]
    [Authorize(Roles = "INVESTIGATOR")]
    public async Task<IActionResult> SubmitReport(
        [FromRoute] int caseId,
        [FromBody] SubmitReportCommand command)
    {
        if (caseId != command.CaseId)
            return BadRequest(new { error = "Case ID mismatch." });

        var reportId = await _mediator.Send(command);
        if (reportId == 0) return NotFound(new { error = "Case not found." });

        return Ok(new { reportId, message = "Investigation report submitted successfully." });
    }
}
