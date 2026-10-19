using MediatR;
using Whistleblowing.Application.Features.Auth.DTOs;

namespace Whistleblowing.Application.Features.Auth.Queries.GetCurrentUser;

public class GetCurrentUserQuery : IRequest<UserInfo?>
{
    public int UserId { get; set; }
    public GetCurrentUserQuery(int userId)
    {
        UserId = userId;
    }
}