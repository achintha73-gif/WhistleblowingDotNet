using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Whistleblowing.Application.Common.Interfaces;
using Whistleblowing.Application.Features.Complaints.Commands.CreateComplaint;
using Whistleblowing.Application.Features.Complaints.Commands.DeleteComplaint;
using Whistleblowing.Application.Features.Complaints.DTOs;
using Whistleblowing.Application.Features.Complaints.Queries.GetComplaintById;
using Whistleblowing.Application.Features.Complaints.Queries.GetComplaints;
using Whistleblowing.Domain.Entities;
using Whistleblowing.Domain.Enums;

namespace Whistleblowing.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ComplaintsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IApplicationDbContext _context;

    public ComplaintsController(IMediator mediator, IApplicationDbContext context)
    {
        _mediator = mediator;
        _context = context;
    }

    [HttpPost]
    [Authorize(Roles = "USER")]
    public async Task<IActionResult> Create([FromBody] CreateComplaintCommand command)
    {
        var result = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetById), new { id = result.ComplaintId }, result);
    }

    [HttpGet]
    [Authorize]
    public async Task<IActionResult> GetAll([FromQuery] string? status)
    {
        var query = new GetComplaintsQuery { Status = status };
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id:int}")]
    [Authorize]
    public async Task<IActionResult> GetById(int id)
    {
        var query = new GetComplaintByIdQuery(id);
        var result = await _mediator.Send(query);
        if (result == null)
        {
            return NotFound(new { error = "Complaint not found." });
        }
        return Ok(result);
    }

    [HttpPut("{id:int}/status")]
    [Authorize(Roles = "ADMIN,MANAGER")]
    public async Task<IActionResult> UpdateStatus(int id, [FromQuery] ComplaintStatus status, CancellationToken cancellationToken)
    {
        if (!Enum.IsDefined(status) || status == ComplaintStatus.CONVERTED_TO_CASE)
            return BadRequest(new { error = "Choose a valid concern status. Use the case conversion action to start an investigation." });

        var complaint = await _context.Complaints.FirstOrDefaultAsync(item => item.ComplaintId == id, cancellationToken);
        if (complaint is null) return NotFound(new { error = "Concern not found." });
        if (complaint.Status == ComplaintStatus.CONVERTED_TO_CASE)
            return Conflict(new { error = "This concern already has an investigation case." });

        if (complaint.Status != status)
        {
            complaint.Status = status;
            complaint.UpdatedAt = DateTime.UtcNow;
            if (!complaint.IsAnonymous && complaint.UserId.HasValue)
            {
                var message = status switch
                {
                    ComplaintStatus.UNDER_REVIEW => $"Your concern \"{complaint.Title}\" is now under review.",
                    ComplaintStatus.APPROVED => $"Your concern \"{complaint.Title}\" has been approved.",
                    ComplaintStatus.REJECTED => $"Your concern \"{complaint.Title}\" was not approved.",
                    _ => $"Your concern \"{complaint.Title}\" status changed to {status.ToString().Replace('_', ' ')}."
                };
                _context.Notifications.Add(new Notification { UserId = complaint.UserId.Value, Message = message, CreatedAt = DateTime.UtcNow });
            }
            await _context.SaveChangesAsync(cancellationToken);
        }

        return Ok(new { message = $"Concern status updated to {status.ToString().Replace('_', ' ')}.", status = status.ToString() });
    }

    [HttpDelete("{id:int}")]
    [Authorize]
    public async Task<IActionResult> Delete(int id)
    {
        await _mediator.Send(new DeleteComplaintCommand(id));
        return NoContent();
    }
}
