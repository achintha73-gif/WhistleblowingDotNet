using MediatR;
using Microsoft.EntityFrameworkCore;
using Whistleblowing.Application.Common.Interfaces;
using Whistleblowing.Application.Features.Auth.DTOs;

namespace Whistleblowing.Application.Features.Auth.Commands.Login;

public class LoginCommandHandler : IRequestHandler<LoginCommand, AuthResponse>
{
    private readonly IApplicationDbContext _context;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenGenerator _jwtGenerator;

    public LoginCommandHandler(
        IApplicationDbContext context,
        IPasswordHasher passwordHasher,
        IJwtTokenGenerator jwtGenerator
    )
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _jwtGenerator = jwtGenerator;
    }

    public async Task<AuthResponse> Handle(
        LoginCommand request,
        CancellationToken cancellationToken
    )
    {
        var email = request.Email.Trim().ToLowerInvariant();

        var user = await _context.Users
            .Include(u => u.Role)
            .Include(u => u.Department)
            .FirstOrDefaultAsync(u => u.Email == email, cancellationToken);

        if (user == null)
        {
            throw new UnauthorizedAccessException("Invalid email or password.");
        }

        if (user.Status != Whistleblowing.Domain.Enums.UserStatus.ACTIVE)
        {
            throw new UnauthorizedAccessException("Account is not active.");
        }

        var passwordValid = _passwordHasher.Verify(request.Password, user.Password);
        if (!passwordValid)
        {
            throw new UnauthorizedAccessException("Invalid email or password.");
        }

        var token = _jwtGenerator.GenerateToken(
            user.UserId,
            user.Email,
            user.Name,
            user.Role.RoleName
        );

        return new AuthResponse
        {
            Token = token,
            User = new UserInfo
            {
                UserId = user.UserId,
                Name = user.Name,
                Email = user.Email,
                Phone = user.Phone,
                Status = user.Status.ToString(),
                RoleId = user.RoleId,
                RoleName = user.Role.RoleName,
                DepartmentId = user.DepartmentId,
                DepartmentName = user.Department?.DepartmentName
            }
        };
    }
}
