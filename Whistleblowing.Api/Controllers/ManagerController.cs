using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Whistleblowing.Application.Common.Interfaces;

namespace Whistleblowing.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "MANAGER")]
public class ManagerController : ControllerBase
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public ManagerController(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    [HttpGet("team")]
    public async Task<IActionResult> GetTeam(CancellationToken cancellationToken)
    {
        if (_currentUser.UserId is not int managerId)
            return Unauthorized();

        // The department's ManagerId is authoritative when an admin assigns
        // a manager from the department editor. Fall back to the manager's
        // own department only when no department is explicitly managed.
        var departmentId = await _context.Departments
            .Where(department => department.ManagerId == managerId)
            .OrderBy(department => department.DepartmentId)
            .Select(department => (int?)department.DepartmentId)
            .FirstOrDefaultAsync(cancellationToken);

        departmentId ??= await _context.Users
            .Where(user => user.UserId == managerId && user.Role.RoleName == "MANAGER")
            .Select(user => user.DepartmentId)
            .FirstOrDefaultAsync(cancellationToken);

        if (departmentId is null)
            return Ok(new { departmentName = (string?)null, users = Array.Empty<object>() });

        var departmentName = await _context.Departments
            .Where(department => department.DepartmentId == departmentId.Value)
            .Select(department => department.DepartmentName)
            .FirstOrDefaultAsync(cancellationToken);

        var users = await _context.Users
            .Where(user => user.DepartmentId == departmentId.Value)
            .OrderBy(user => user.Name)
            .Select(user => new
            {
                user.UserId,
                user.Name,
                user.Email,
                Role = user.Role.RoleName,
                DepartmentName = user.Department == null ? departmentName : user.Department.DepartmentName,
                Status = user.Status.ToString(),
                user.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return Ok(new { departmentName, users });
    }
}
