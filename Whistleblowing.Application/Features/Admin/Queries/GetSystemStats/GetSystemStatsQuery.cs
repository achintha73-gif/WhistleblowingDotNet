using MediatR;

namespace Whistleblowing.Application.Features.Admin.Queries.GetSystemStats;

public class GetSystemStatsQuery : IRequest<SystemStatsDto>
{
}

public class SystemStatsDto
{
    public int TotalComplaints { get; set; }
    public int TotalCases { get; set; }
    public int TotalUsers { get; set; }
    public int TotalEvidenceFiles { get; set; }
}