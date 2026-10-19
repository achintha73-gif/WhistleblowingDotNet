namespace Whistleblowing.Application.Common.Interfaces;

/// <summary>
/// Interface for password hashing and verification.
/// </summary>
public interface IPasswordHasher
{
    /// <summary>
    /// Hash a plain text password.
    /// </summary>
    string Hash(string password);

    /// <summary>
    /// Verify a plain text password against a hashed password.
    /// </summary>
    bool Verify(string password, string hashedPassword);
}