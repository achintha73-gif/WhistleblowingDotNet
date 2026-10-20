using MediatR;

namespace Whistleblowing.Application.Features.Notifications.Commands.MarkAsRead;

public class MarkNotificationAsReadCommand : IRequest<bool>
{
    public int NotificationId { get; set; }
}