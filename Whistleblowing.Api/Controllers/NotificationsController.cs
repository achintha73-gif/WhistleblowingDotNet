using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Whistleblowing.Application.Features.Notifications.Commands.MarkAsRead;
using Whistleblowing.Application.Features.Notifications.Queries.GetMyNotifications;

namespace Whistleblowing.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly IMediator _mediator;

    public NotificationsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetMyNotifications()
    {
        var result = await _mediator.Send(new GetMyNotificationsQuery());
        return Ok(result);
    }

    [HttpPut("{id:int}/read")]
    public async Task<IActionResult> MarkAsRead([FromRoute] int id)
    {
        var success = await _mediator.Send(new MarkNotificationAsReadCommand { NotificationId = id });
        if (!success) return NotFound(new { error = "Notification not found." });
        return Ok(new { message = "Notification marked as read." });
    }
}