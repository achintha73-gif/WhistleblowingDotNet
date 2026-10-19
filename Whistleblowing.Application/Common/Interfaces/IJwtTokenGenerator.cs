namespace Whistleblowing.Application.Common.Interfaces;

/// <summary>
/// Interface for generating JWT tokens.
/// </summary>
public interface IJwtTokenGenerator
{
    /// <summary>
    /// Generate a JWT token for the given user.
    /// </summary>
    string GenerateToken(
        int userId,
        string email,
        string name,
        string roleName
    );
}