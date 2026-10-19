namespace Whistleblowing.Domain.Common;

/// <summary>
/// Interface for entities that can raise domain events.
/// </summary>
public interface IHasDomainEvents
{
    IReadOnlyCollection<IDomainEvent> DomainEvents { get; }
    void AddDomainEvent(IDomainEvent domainEvent);
    void ClearDomainEvents();
}