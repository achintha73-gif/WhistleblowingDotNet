using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Whistleblowing.Api.Models.Settings;
using Whistleblowing.Application.Common.Interfaces;
using Whistleblowing.Domain.Entities;

namespace Whistleblowing.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "ADMIN")]
public class SettingsController : ControllerBase
{
    private readonly IApplicationDbContext _context;

    public SettingsController(IApplicationDbContext context) => _context = context;

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var settings = await _context.SystemSettings
            .OrderBy(setting => setting.Key)
            .Select(setting => new
            {
                setting.SettingId,
                setting.Key,
                setting.Value,
                setting.Description,
                setting.UpdatedAt
            })
            .ToListAsync(cancellationToken);
        return Ok(settings);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] SaveSettingRequest request, CancellationToken cancellationToken)
    {
        var key = request.Key.Trim();
        if (await _context.SystemSettings.AnyAsync(setting => setting.Key.ToLower() == key.ToLower(), cancellationToken))
            return Conflict(new { error = "A setting with this key already exists." });

        var setting = new SystemSetting
        {
            Key = key,
            Value = request.Value.Trim(),
            Description = CleanOptional(request.Description),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        _context.SystemSettings.Add(setting);
        await _context.SaveChangesAsync(cancellationToken);
        return CreatedAtAction(nameof(GetAll), new { id = setting.SettingId }, setting);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] SaveSettingRequest request, CancellationToken cancellationToken)
    {
        var setting = await _context.SystemSettings.FirstOrDefaultAsync(item => item.SettingId == id, cancellationToken);
        if (setting is null) return NotFound(new { error = "Setting not found." });

        var key = request.Key.Trim();
        if (await _context.SystemSettings.AnyAsync(item => item.SettingId != id && item.Key.ToLower() == key.ToLower(), cancellationToken))
            return Conflict(new { error = "A setting with this key already exists." });

        setting.Key = key;
        setting.Value = request.Value.Trim();
        setting.Description = CleanOptional(request.Description);
        setting.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var setting = await _context.SystemSettings.FirstOrDefaultAsync(item => item.SettingId == id, cancellationToken);
        if (setting is null) return NotFound(new { error = "Setting not found." });

        _context.SystemSettings.Remove(setting);
        await _context.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    private static string? CleanOptional(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
