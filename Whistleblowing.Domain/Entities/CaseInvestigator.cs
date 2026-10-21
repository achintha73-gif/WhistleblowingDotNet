namespace Whistleblowing.Domain.Entities;

public class CaseInvestigator
{
    public int CaseId { get; set; }
    public int InvestigatorId { get; set; }

    public Case Case { get; set; } = null!;
    public User Investigator { get; set; } = null!;
}
