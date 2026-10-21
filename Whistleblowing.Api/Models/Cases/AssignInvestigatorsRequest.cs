using System.ComponentModel.DataAnnotations;

namespace Whistleblowing.Api.Models.Cases;

public sealed class AssignInvestigatorsRequest
{
    [Required, MinLength(1)]
    public List<int> InvestigatorIds { get; set; } = new();
}
