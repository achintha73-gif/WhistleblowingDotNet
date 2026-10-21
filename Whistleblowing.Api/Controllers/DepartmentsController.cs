using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Whistleblowing.Api.Models.Departments;
using Whistleblowing.Application.Common.Interfaces;
using Whistleblowing.Domain.Entities;

namespace Whistleblowing.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "ADMIN")]
public class DepartmentsController : ControllerBase
{
    private readonly IApplicationDbContext _context;

    public DepartmentsController(IApplicationDbContext context) => _context = context;

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var departments = await _context.Departments
            .OrderBy(d => d.DepartmentName)
            .Select(d => new
            {
                d.DepartmentId,
                d.DepartmentName,
                d.Description,
                d.Status,
                d.ManagerId,
                ManagerName = d.Manager == null ? null : d.Manager.Name,
                UserCount = d.Users.Count,
                d.CreatedAt,
                d.UpdatedAt
            })
            .ToListAsync(cancellationToken);

        return Ok(departments);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] SaveDepartmentRequest request, CancellationToken cancellationToken)
    {
        var name = request.DepartmentName.Trim();
        if (await _context.Departments.AnyAsync(d => d.DepartmentName.ToLower() == name.ToLower(), cancellationToken))
            return Conflict(new { error = "A department with this name already exists." });

        if (request.ManagerId.HasValue && !await IsManager(request.ManagerId.Value, cancellationToken))
            return BadRequest(new { error = "Choose an existing manager account." });

        var department = new Department
        {
            DepartmentName = name,
            Description = CleanOptional(request.Description),
            ManagerId = request.ManagerId,
            Status = "active",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Departments.Add(department);
        await _context.SaveChangesAsync(cancellationToken);
        return CreatedAtAction(nameof(GetAll), new { id = department.DepartmentId }, department);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] SaveDepartmentRequest request, CancellationToken cancellationToken)
    {
        var department = await _context.Departments.FirstOrDefaultAsync(d => d.DepartmentId == id, cancellationToken);
        if (department is null) return NotFound(new { error = "Department not found." });

        var name = request.DepartmentName.Trim();
        if (await _context.Departments.AnyAsync(d => d.DepartmentId != id && d.DepartmentName.ToLower() == name.ToLower(), cancellationToken))
            return Conflict(new { error = "A department with this name already exists." });

        if (request.ManagerId.HasValue && !await IsManager(request.ManagerId.Value, cancellationToken))
            return BadRequest(new { error = "Choose an existing manager account." });

        department.DepartmentName = name;
        department.Description = CleanOptional(request.Description);
        department.ManagerId = request.ManagerId;
        department.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var department = await _context.Departments.FirstOrDefaultAsync(d => d.DepartmentId == id, cancellationToken);
        if (department is null) return NotFound(new { error = "Department not found." });

        _context.Departments.Remove(department);
        await _context.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    private async Task<bool> IsManager(int userId, CancellationToken cancellationToken) =>
        await _context.Users.AnyAsync(u => u.UserId == userId && u.Role.RoleName == "MANAGER", cancellationToken);

    private static string? CleanOptional(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
