using Dapper;
using MediatR;
using Whistleblowing.Application.Common.Interfaces;

namespace Whistleblowing.Application.Features.Notifications.Queries.GetMyNotifications;

public class GetMyNotificationsQueryHandler : IRequestHandler<GetMyNotificationsQuery, List<NotificationDto>>
{
    private readonly IDapperContext _dapperContext;
    private readonly ICurrentUserService _currentUser;

    public GetMyNotificationsQueryHandler(IDapperContext dapperContext, ICurrentUserService currentUser)
    {
        _dapperContext = dapperContext;
        _currentUser = currentUser;
    }

    public async Task<List<NotificationDto>> Handle(GetMyNotificationsQuery request, CancellationToken cancellationToken)
    {
        if (_currentUser.UserId == null)
            return new List<NotificationDto>();

        using var connection = _dapperContext.CreateConnection();
        var sql = @"
            SELECT NotificationId, Message, IsRead, CreatedAt 
            FROM Notifications 
            WHERE UserId = @UserId 
            ORDER BY CreatedAt DESC";

        var notifications = await connection.QueryAsync<NotificationDto>(sql, new { UserId = _currentUser.UserId });
        return notifications.ToList();
    }
}