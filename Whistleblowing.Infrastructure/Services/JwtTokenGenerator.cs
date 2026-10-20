using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Whistleblowing.Application.Common.Interfaces;

namespace Whistleblowing.Infrastructure.Services;

public class JwtTokenGenerator : IJwtTokenGenerator
{
    private readonly IConfiguration _configuration;

    public JwtTokenGenerator(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public string GenerateToken(
        int userId,
        string email,
        string name,
        string roleName
    )
    {
        var secret = _configuration["Jwt:Secret"]
            ?? throw new InvalidOperationException("JWT Secret is not configured.");
        var issuer = _configuration["Jwt:Issuer"] ?? "WhistleblowingSystem";
        var audience = _configuration["Jwt:Audience"] ?? "WhistleblowingSystemUsers";
        var expiryDays = int.TryParse(_configuration["Jwt:ExpiryDays"], out var d) ? d : 7;

        // 🔍 DEBUG: Verify secret matches what Program.cs has
        Console.WriteLine("========================================");
        Console.WriteLine($"[JWT GEN] Secret length = {secret.Length}");
        Console.WriteLine($"[JWT GEN] Secret = {secret}");
        Console.WriteLine($"[JWT GEN] Issuer = {issuer}");
        Console.WriteLine($"[JWT GEN] Audience = {audience}");
        Console.WriteLine($"[JWT GEN] UserId = {userId}, Role = {roleName}");
        Console.WriteLine("========================================");

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, userId.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, email),
            new Claim(JwtRegisteredClaimNames.Name, name),
            new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
            new Claim(ClaimTypes.Email, email),
            new Claim(ClaimTypes.Name, name),
            new Claim(ClaimTypes.Role, roleName),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddDays(expiryDays),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}