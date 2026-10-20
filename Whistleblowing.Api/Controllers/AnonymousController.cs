using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Whistleblowing.Application.Features.Anonymous.Commands.AddAnonymousInfo;
using Whistleblowing.Application.Features.Anonymous.Commands.SubmitAnonymous;
using Whistleblowing.Application.Features.Anonymous.Queries.TrackComplaint;

namespace Whistleblowing.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[AllowAnonymous]
public class AnonymousController : ControllerBase
{
    private readonly IMediator _mediator;

    public AnonymousController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost("report")]
    public async Task<IActionResult> Report([FromBody] SubmitAnonymousCommand command)
    {
        var result = await _mediator.Send(command);
        return CreatedAtAction(nameof(Track), new { code = result.ReferenceCode }, result);
    }

    [HttpGet("track/{code}")]
    public async Task<IActionResult> Track([FromRoute] string code)
    {
        var dto = await _mediator.Send(new GetComplaintByCodeQuery(code));

        if (dto is null)
        {
            return NotFound(new { error = "Invalid reference code." });
        }

        return Ok(dto);
    }

    [HttpPost("add-info")]
    public async Task<IActionResult> AddInfo([FromBody] AddAnonymousInfoCommand command)
    {
        var result = await _mediator.Send(command);
        
        // null return වුනොත් 404 දෙන්න (API crash නොවෙන්න)
        if (result is null)
        {
            return NotFound(new { error = "Invalid reference code." });
        }

        return Ok(result);
    }
}