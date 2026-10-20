using MediatR;

namespace Whistleblowing.Application.Features.Users.Commands.CreateUser;

public class CreateUserCommand : IRequest<int>
{
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string RoleName { get; set; } = "USER"; // Default is USER (Employee)
}