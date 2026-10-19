namespace Whistleblowing.Domain.Common;

/// <summary>
/// Marker interface for domain events.
/// Domain events represent something important that happened in the domain.
/// </summary>
public interface IDomainEvent
{
    DateTime OccurredAt { get; }
}