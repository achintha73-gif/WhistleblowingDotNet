namespace Whistleblowing.Domain.Entities;

public class Notification
{
    public int NotificationId { get; set; }
    public string Message { get; set; } = string.Empty;
    public bool IsRead { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public int UserId { get; set; }

    // Navigation
    public User User { get; set; } = null!;
}