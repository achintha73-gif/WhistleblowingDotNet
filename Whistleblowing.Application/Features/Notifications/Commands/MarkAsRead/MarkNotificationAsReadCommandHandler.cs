using MediatR;
using Microsoft.EntityFrameworkCore;
using Whistleblowing.Application.Common.Interfaces;

namespace Whistleblowing.Application.Features.Notifications.Commands.MarkAsRead;

public class MarkNotificationAsReadCommandHandler : IRequestHandler<MarkNotificationAsReadCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public MarkNotificationAsReadCommandHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<bool> Handle(MarkNotificationAsReadCommand request, CancellationToken cancellationToken)
    {
        var notification = await _context.Notifications
            .FirstOrDefaultAsync(n => n.NotificationId == request.NotificationId && n.UserId == _currentUser.UserId, cancellationToken);

        if (notification == null) return false;

        notification.IsRead = true;
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}