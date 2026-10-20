using MediatR;
using Whistleblowing.Application.Common.Interfaces;
using Dapper;

namespace Whistleblowing.Application.Features.Notifications.Queries.GetMyNotifications;

public class GetMyNotificationsQuery : IRequest<List<NotificationDto>>
{
}

public class NotificationDto
{
    public int NotificationId { get; set; }
    public string Message { get; set; } = string.Empty;
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; }
}