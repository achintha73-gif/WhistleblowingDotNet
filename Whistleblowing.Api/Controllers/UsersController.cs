using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Whistleblowing.Application.Common.Interfaces;
using Whistleblowing.Api.Models.Users;
using Whistleblowing.Application.Features.Users.Commands.CreateUser;
using Whistleblowing.Domain.Enums;

namespace Whistleblowing.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "ADMIN")]
public class UsersController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IApplicationDbContext _context;

    public UsersController(IMediator mediator, IApplicationDbContext context)
    {
        _mediator = mediator;
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllUsers()
    {
        var users = await _context.Users
            .Select(u => new
            {
                u.UserId,
                u.Name,
                u.Email,
                u.Phone,
                u.Status,
                u.RoleId,
                RoleName = u.Role.RoleName,
                u.DepartmentId,
                DepartmentName = u.Department == null ? null : u.Department.DepartmentName,
                u.CreatedAt
            })
            .ToListAsync();
        return Ok(users);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUserRequest request, CancellationToken cancellationToken)
    {
        var user = await _context.Users.Include(item => item.Role)
            .FirstOrDefaultAsync(item => item.UserId == id, cancellationToken);
        if (user is null) return NotFound(new { error = "User not found." });

        var email = request.Email.Trim().ToLowerInvariant();
        if (await _context.Users.AnyAsync(item => item.UserId != id && item.Email.ToLower() == email, cancellationToken))
            return Conflict(new { error = "That email address is already in use." });

        if (!Enum.IsDefined(request.Status))
            return BadRequest(new { error = "Choose a valid account status." });

        var role = await _context.Roles.FirstOrDefaultAsync(item => item.RoleId == request.RoleId, cancellationToken);
        if (role is null) return BadRequest(new { error = "Choose a valid role." });

        if (request.DepartmentId.HasValue && !await _context.Departments.AnyAsync(item => item.DepartmentId == request.DepartmentId.Value, cancellationToken))
            return BadRequest(new { error = "Choose a valid department." });

        var currentUserId = GetCurrentUserId();
        if (currentUserId == id && (role.RoleName != "ADMIN" || request.Status != UserStatus.ACTIVE))
            return Conflict(new { error = "You cannot remove administrator access or deactivate your own account." });

        if (user.Role.RoleName == "ADMIN" && user.Status == UserStatus.ACTIVE &&
            (role.RoleName != "ADMIN" || request.Status != UserStatus.ACTIVE) &&
            await CountActiveAdmins(cancellationToken) <= 1)
            return Conflict(new { error = "At least one active administrator must remain." });

        user.Name = request.Name.Trim();
        user.Email = email;
        user.Phone = CleanOptional(request.Phone);
        user.RoleId = role.RoleId;
        user.DepartmentId = request.DepartmentId;
        user.Status = request.Status;
        user.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteUser(int id, CancellationToken cancellationToken)
    {
        if (GetCurrentUserId() == id)
            return Conflict(new { error = "You cannot delete your own account." });

        var user = await _context.Users.Include(item => item.Role)
            .FirstOrDefaultAsync(item => item.UserId == id, cancellationToken);
        if (user is null) return NotFound(new { error = "User not found." });

        if (user.Role.RoleName == "ADMIN" && user.Status == UserStatus.ACTIVE && await CountActiveAdmins(cancellationToken) <= 1)
            return Conflict(new { error = "The last active administrator cannot be deleted." });

        if (await _context.CaseStatusHistories.AnyAsync(item => item.ChangedBy == id, cancellationToken))
            return Conflict(new { error = "This account is referenced by case audit history. Suspend it instead to preserve the record." });

        var submittedInfo = await _context.AdditionalInformations
            .Where(item => item.SubmittedBy == id)
            .ToListAsync(cancellationToken);
        foreach (var info in submittedInfo) info.SubmittedBy = null;

        _context.Users.Remove(user);
        await _context.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    [HttpPost]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserCommand command)
    {
        var userId = await _mediator.Send(command);
        return Ok(new { userId, message = "User created successfully." });
    }

    private int? GetCurrentUserId()
    {
        var rawId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(rawId, out var currentUserId) ? currentUserId : null;
    }

    private Task<int> CountActiveAdmins(CancellationToken cancellationToken) =>
        _context.Users.CountAsync(item => item.Role.RoleName == "ADMIN" && item.Status == UserStatus.ACTIVE, cancellationToken);

    private static string? CleanOptional(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
