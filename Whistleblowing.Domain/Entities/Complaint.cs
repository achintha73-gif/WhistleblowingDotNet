using System.Security.Policy;
using Whistleblowing.Domain.Enums;

namespace Whistleblowing.Domain.Entities;

public class Complaint
{
    public int ComplaintId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? Category { get; set; }
    public ComplaintStatus Status { get; set; } = ComplaintStatus.PENDING;
    public bool IsAnonymous { get; set; } = false;
    public string? ReferenceCode { get; set; }
    public int? UserId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public User? User { get; set; }
    public ICollection<AdditionalInformation> AdditionalInfo { get; set; } = new List<AdditionalInformation>();
    public ICollection<Evidence> Evidence { get; set; } = new List<Evidence>();
    public Case? Case { get; set; }
}