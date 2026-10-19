using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Whistleblowing.Application.Common.Interfaces;
using Whistleblowing.Application.Features.Auth.DTOs;

namespace Whistleblowing.Application.Features.Auth.Commands.Login;

public class LoginCommandHandler : IRequestHandler<LoginCommand, AuthResponse>
{
    private readonly IApplicationDbContext _context;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenGenerator _jwtGenerator;
    private readonly ILogger<LoginCommandHandler> _logger;

    public LoginCommandHandler(
        IApplicationDbContext context,
        IPasswordHasher passwordHasher,
        IJwtTokenGenerator jwtGenerator,
        ILogger<LoginCommandHandler> logger
    )
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _jwtGenerator = jwtGenerator;
        _logger = logger;
    }

    public async Task<AuthResponse> Handle(
        LoginCommand request,
        CancellationToken cancellationToken
    )
    {
        _logger.LogWarning("[LOGIN] Received email: '{Email}'", request.Email);
        _logger.LogWarning("[LOGIN] Received password: '{Password}'", request.Password);

        var email = request.Email.Trim().ToLowerInvariant();
        _logger.LogWarning("[LOGIN] Normalized email: '{Email}'", email);

        var user = await _context.Users
            .Include(u => u.Role)
            .Include(u => u.Department)
            .FirstOrDefaultAsync(u => u.Email == email, cancellationToken);

        _logger.LogWarning("[LOGIN] User found: {User}", user != null ? user.Name : "NULL");

        if (user == null)
        {
            throw new UnauthorizedAccessException("Invalid email or password.");
        }

        _logger.LogWarning("[LOGIN] User.Email: '{Email}'", user.Email);
        _logger.LogWarning("[LOGIN] User.Status: {Status}", user.Status);
        _logger.LogWarning("[LOGIN] Password hash length: {Length}", user.Password.Length);

        if (user.Status != Whistleblowing.Domain.Enums.UserStatus.ACTIVE)
        {
            _logger.LogWarning("[LOGIN] Status NOT active");
            throw new UnauthorizedAccessException("Account is not active.");
        }

        _logger.LogWarning("[LOGIN] Verifying password...");
        bool passwordValid = false;
        try
        {
            passwordValid = _passwordHasher.Verify(request.Password, user.Password);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[LOGIN] Password verify EXCEPTION");
            throw;
        }

        _logger.LogWarning("[LOGIN] Password valid: {Valid}", passwordValid);

        if (!passwordValid)
        {
            throw new UnauthorizedAccessException("Invalid email or password.");
        }

        _logger.LogWarning("[LOGIN] Generating JWT...");
        var token = _jwtGenerator.GenerateToken(
            user.UserId,
            user.Email,
            user.Name,
            user.Role.RoleName
        );

        _logger.LogWarning("[LOGIN] SUCCESS: {Name}", user.Name);

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