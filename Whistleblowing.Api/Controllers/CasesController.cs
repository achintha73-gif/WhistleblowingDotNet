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
using Whistleblowing.Api.Services;

namespace Whistleblowing.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CasesController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly IEmailSender _emailSender;
    private readonly ILogger<CasesController> _logger;

    public CasesController(IMediator mediator, IApplicationDbContext context, ICurrentUserService currentUser, IEmailSender emailSender, ILogger<CasesController> logger)
    {
        _mediator = mediator;
        _context = context;
        _currentUser = currentUser;
        _emailSender = emailSender;
        _logger = logger;
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

    private async Task<bool> CanAccessCase(int caseId, CancellationToken cancellationToken)
    {
        if (_currentUser.UserId is null) return false;
        return await _context.Cases.AnyAsync(item => item.CaseId == caseId &&
            (_currentUser.RoleName == "ADMIN" || _currentUser.RoleName == "MANAGER" ||
             (_currentUser.RoleName == "INVESTIGATOR" &&
              (item.AssignedInvestigatorId == _currentUser.UserId ||
               item.InvestigatorAssignments.Any(a => a.InvestigatorId == _currentUser.UserId)))), cancellationToken);
    }

    [HttpGet("{caseId:int}/evidence")]
    [Authorize(Roles = "ADMIN,MANAGER,INVESTIGATOR")]
    public async Task<IActionResult> GetEvidence(int caseId, CancellationToken cancellationToken)
    {
        if (!await CanAccessCase(caseId, cancellationToken)) return NotFound();
        var complaintId = await _context.Cases.Where(c => c.CaseId == caseId).Select(c => c.ComplaintId).SingleAsync(cancellationToken);
        var evidence = await _context.Evidence.Where(e => e.CaseId == caseId || e.ComplaintId == complaintId)
            .OrderByDescending(e => e.UploadedAt)
            .Select(e => new { e.EvidenceId, e.FileName, e.Description, e.UploadedAt, HasFile = e.FilePath != null, UploaderName = e.Uploader == null ? null : e.Uploader.Name })
            .ToListAsync(cancellationToken);
        return Ok(evidence);
    }

    [HttpGet("{caseId:int}/reports")]
    [Authorize(Roles = "ADMIN,MANAGER,INVESTIGATOR")]
    public async Task<IActionResult> GetReports(int caseId, CancellationToken cancellationToken)
    {
        if (!await CanAccessCase(caseId, cancellationToken)) return NotFound();
        var reports = await _context.InvestigationReports.Where(r => r.CaseId == caseId)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new { r.ReportId, r.Findings, r.Recommendation, r.CreatedAt })
            .ToListAsync(cancellationToken);
        return Ok(reports);
    }

    private async Task<bool> NotifyCaseUpdateByEmail(int caseId, bool includeManagers)
    {
        var recipients = new List<string>();
        var ownerEmail = await _context.Cases.AsNoTracking().Where(c => c.CaseId == caseId && !c.Complaint.IsAnonymous && c.Complaint.User != null && c.Complaint.User.Status == UserStatus.ACTIVE)
            .Select(c => c.Complaint.User!.Email).FirstOrDefaultAsync();
        if (!string.IsNullOrWhiteSpace(ownerEmail)) recipients.Add(ownerEmail);
        if (includeManagers)
            recipients.AddRange(await _context.Users.AsNoTracking().Where(u => u.Role.RoleName == "MANAGER" && u.Status == UserStatus.ACTIVE).Select(u => u.Email).ToListAsync());
        if (recipients.Count == 0) return true;
        if (!_emailSender.IsConfigured) return false;
        var succeeded = true;
        foreach (var email in recipients.Distinct(StringComparer.OrdinalIgnoreCase))
        {
            try { await _emailSender.SendCaseStatusAsync(email, CancellationToken.None); }
            catch (Exception ex) { _logger.LogWarning(ex, "Case update email could not be sent for case {CaseId}", caseId); succeeded = false; }
        }
        return succeeded;
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
        var before = await _context.Cases.AsNoTracking().Where(c => c.CaseId == caseId)
            .Select(c => new { c.Status, c.Complaint.IsAnonymous, Email = c.Complaint.User == null ? null : c.Complaint.User.Email }).FirstOrDefaultAsync();
        var command = new UpdateCaseStatusCommand { CaseId = caseId, NewStatus = newStatus };
        var success = await _mediator.Send(command);
        if (!success) return NotFound(new { error = "Case not found." });
        var emailStatus = "not_applicable";
        if (before != null && before.Status != newStatus)
            emailStatus = await NotifyCaseUpdateByEmail(caseId, _currentUser.RoleName == "INVESTIGATOR") ? "accepted" : "unavailable";
        return Ok(new { message = $"Case status updated to {newStatus}.", emailStatus });
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

        var emailStatus = await NotifyCaseUpdateByEmail(caseId, true) ? "accepted" : "unavailable";
        return Ok(new { reportId, message = "Investigation report submitted successfully.", emailStatus });
    }
}
