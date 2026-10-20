using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Whistleblowing.Application.Features.Complaints.Commands.CreateComplaint;
using Whistleblowing.Application.Features.Complaints.Commands.DeleteComplaint;
using Whistleblowing.Application.Features.Complaints.DTOs;
using Whistleblowing.Application.Features.Complaints.Queries.GetComplaintById;
using Whistleblowing.Application.Features.Complaints.Queries.GetComplaints;

namespace Whistleblowing.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ComplaintsController : ControllerBase
{
    private readonly IMediator _mediator;

    public ComplaintsController(IMediator mediator)
    {
        _mediator = mediator;
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

    [HttpDelete("{id:int}")]
    [Authorize]
    public async Task<IActionResult> Delete(int id)
    {
        await _mediator.Send(new DeleteComplaintCommand(id));
        return NoContent();
    }
}