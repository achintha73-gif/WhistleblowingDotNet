namespace Whistleblowing.Application.Common.Interfaces;

public interface ICurrentUserService
{
    int? UserId { get; }
    string? Email { get; }
    string? RoleName { get; }
    bool IsAuthenticated { get; }
}