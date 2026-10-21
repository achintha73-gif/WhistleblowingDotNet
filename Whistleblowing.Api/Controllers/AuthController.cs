using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;
using System.Security.Claims;
using Whistleblowing.Api.Models.Auth;
using Whistleblowing.Api.Services;
using Whistleblowing.Application.Common.Interfaces;
using Whistleblowing.Application.Features.Auth.Commands.Login;
using Whistleblowing.Application.Features.Auth.DTOs;
using Whistleblowing.Application.Features.Auth.Queries.GetCurrentUser;
using Whistleblowing.Application.Features.Users.Commands.CreateUser;

namespace Whistleblowing.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IApplicationDbContext _context;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IEmailSender _emailSender;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AuthController> _logger;

    public AuthController(IMediator mediator, IApplicationDbContext context, IPasswordHasher passwordHasher,
        IEmailSender emailSender, IConfiguration configuration, ILogger<AuthController> logger)
    {
        _mediator = mediator;
        _context = context;
        _passwordHasher = passwordHasher;
        _emailSender = emailSender;
        _configuration = configuration;
        _logger = logger;
    }

    /// <summary>
    /// Login with email and password.
    /// Returns JWT token + user info.
    /// </summary>
    [HttpPost("login")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login([FromBody] LoginCommand command)
    {
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    /// <summary>
    /// Create an employee account. Public registration can only create USER accounts.
    /// </summary>
    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            return BadRequest(new { error = "Name is required." });
        }

        var userId = await _mediator.Send(new CreateUserCommand
        {
            Name = request.Name.Trim(),
            Email = request.Email.Trim().ToLowerInvariant(),
            Password = request.Password,
            RoleName = "USER"
        });

        return Ok(new { userId, message = "Account created successfully." });
    }

    /// <summary>
    /// Get current user info (requires authentication).
    /// </summary>
    [HttpGet("me")]
    [Authorize]
    [ProducesResponseType(typeof(UserInfo), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetCurrentUser()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized(new { error = "Invalid token claims." });
        }

        var user = await _mediator.Send(new GetCurrentUserQuery(userId));
        if (user == null)
        {
            return Unauthorized(new { error = "User not found or inactive." });
        }

        return Ok(user);
    }

    [HttpPut("profile")]
    [Authorize]
    public async Task<IActionResult> UpdateProfile([FromBody] ProfileUpdateRequest request, CancellationToken cancellationToken)
    {
        var user = await GetSignedInUser(cancellationToken);
        if (user is null) return Unauthorized(new { error = "Your account could not be found." });
        user.Name = request.Name.Trim();
        user.Phone = string.IsNullOrWhiteSpace(request.Phone) ? null : request.Phone.Trim();
        user.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);
        return Ok(new { user.UserId, user.Name, user.Email, user.Phone, Status = user.Status.ToString(), user.RoleId, RoleName = user.Role.RoleName.ToString(), user.DepartmentId, DepartmentName = user.Department?.DepartmentName });
    }

    [HttpPut("password")]
    [Authorize]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request, CancellationToken cancellationToken)
    {
        var user = await GetSignedInUser(cancellationToken);
        if (user is null) return Unauthorized(new { error = "Your account could not be found." });
        if (!_passwordHasher.Verify(request.CurrentPassword, user.Password))
            return BadRequest(new { error = "Your current password is incorrect." });
        user.Password = _passwordHasher.Hash(request.NewPassword);
        user.UpdatedAt = DateTime.UtcNow;
        var activeResetTokens = await _context.PasswordResetTokens.Where(item => item.UserId == user.UserId && item.UsedAt == null).ToListAsync(cancellationToken);
        foreach (var item in activeResetTokens) item.UsedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);
        return Ok(new { message = "Password updated successfully." });
    }

    [HttpPost("forgot-password")]
    [AllowAnonymous]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request, CancellationToken cancellationToken)
    {
        const string responseMessage = "If an account exists for that email, a password reset link will be sent shortly.";
        if (!_emailSender.IsConfigured)
        {
            _logger.LogError("Password reset email delivery is unavailable because SMTP host/from settings are missing.");
            return StatusCode(StatusCodes.Status503ServiceUnavailable, new
            {
                error = "Password reset email is not configured. Please ask the administrator to configure SMTP settings."
            });
        }

        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        var user = await _context.Users.FirstOrDefaultAsync(item => item.Email.ToLower() == normalizedEmail, cancellationToken);
        if (user is null || user.Status != Whistleblowing.Domain.Enums.UserStatus.ACTIVE) return Ok(new { message = responseMessage });

        var activeTokens = await _context.PasswordResetTokens.Where(item => item.UserId == user.UserId && item.UsedAt == null).ToListAsync(cancellationToken);

        var rawToken = WebEncoders.Base64UrlEncode(RandomNumberGenerator.GetBytes(32));
        var tokenHash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(rawToken)));
        var resetToken = new Whistleblowing.Domain.Entities.PasswordResetToken
        {
            UserId = user.UserId,
            TokenHash = tokenHash,
            ExpiresAt = DateTime.UtcNow.AddMinutes(30),
            CreatedAt = DateTime.UtcNow
        };
        _context.PasswordResetTokens.Add(resetToken);
        await _context.SaveChangesAsync(cancellationToken);

        var frontendUrl = _configuration["Email:FrontendBaseUrl"] ?? "http://localhost:5173";
        var resetUrl = $"{frontendUrl.TrimEnd('/')}/reset-password?email={Uri.EscapeDataString(user.Email)}&token={Uri.EscapeDataString(rawToken)}";
        try
        {
            await _emailSender.SendPasswordResetAsync(user.Email, resetUrl, cancellationToken);
        }
        catch (Exception exception)
        {
            resetToken.UsedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync(CancellationToken.None);

            if (exception is OperationCanceledException && cancellationToken.IsCancellationRequested)
                throw;

            _logger.LogError(exception, "Password reset email could not be sent.");
            return StatusCode(StatusCodes.Status503ServiceUnavailable, new
            {
                error = "We could not send the reset email right now. Please try again later or contact support."
            });
        }

        foreach (var item in activeTokens) item.UsedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);
        return Ok(new { message = responseMessage });
    }

    [HttpPost("reset-password")]
    [AllowAnonymous]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request, CancellationToken cancellationToken)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var tokenHash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(request.Token)));
        var resetToken = await _context.PasswordResetTokens
            .Include(item => item.User)
            .FirstOrDefaultAsync(item => item.TokenHash == tokenHash && item.User.Email.ToLower() == email, cancellationToken);
        if (resetToken is null || resetToken.UsedAt.HasValue || resetToken.ExpiresAt <= DateTime.UtcNow)
            return BadRequest(new { error = "This password reset link is invalid or has expired. Request a new link." });

        resetToken.User.Password = _passwordHasher.Hash(request.NewPassword);
        resetToken.User.UpdatedAt = DateTime.UtcNow;
        resetToken.UsedAt = DateTime.UtcNow;
        var otherTokens = await _context.PasswordResetTokens.Where(item => item.UserId == resetToken.UserId && item.UsedAt == null).ToListAsync(cancellationToken);
        foreach (var item in otherTokens) item.UsedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);
        return Ok(new { message = "Your password has been reset. You can now sign in." });
    }

    private Task<Whistleblowing.Domain.Entities.User?> GetSignedInUser(CancellationToken cancellationToken)
    {
        var rawId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(rawId, out var userId)) return Task.FromResult<Whistleblowing.Domain.Entities.User?>(null);
        return _context.Users.Include(item => item.Role).Include(item => item.Department)
            .FirstOrDefaultAsync(item => item.UserId == userId, cancellationToken);
    }
}

public sealed class RegisterRequest
{
    [System.ComponentModel.DataAnnotations.Required]
    [System.ComponentModel.DataAnnotations.StringLength(120, MinimumLength = 2)]
    public string Name { get; set; } = string.Empty;

    [System.ComponentModel.DataAnnotations.Required]
    [System.ComponentModel.DataAnnotations.EmailAddress]
    [System.ComponentModel.DataAnnotations.StringLength(254)]
    public string Email { get; set; } = string.Empty;

    [System.ComponentModel.DataAnnotations.Required]
    [System.ComponentModel.DataAnnotations.RegularExpression(
        @"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$",
        ErrorMessage = "Use at least 8 characters with uppercase, lowercase, a number, and a symbol.")]
    public string Password { get; set; } = string.Empty;
}
