namespace Whistleblowing.Domain.Common;

/// <summary>
/// Optional base entity for entities that need domain event support.
/// Currently not used by default — entities inherit directly.
/// Use this in future for entities that need to raise events.
/// </summary>
public abstract class BaseEntity : IHasDomainEvents
{
    private readonly List<IDomainEvent> _domainEvents = new();

    public IReadOnlyCollection<IDomainEvent> DomainEvents =>
        _domainEvents.AsReadOnly();

    public void AddDomainEvent(IDomainEvent domainEvent)
    {
        _domainEvents.Add(domainEvent);
    }

    public void ClearDomainEvents()
    {
        _domainEvents.Clear();
    }
}