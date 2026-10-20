using Dapper;
using MediatR;
using Whistleblowing.Application.Common.Interfaces;

namespace Whistleblowing.Application.Features.Admin.Queries.GetSystemStats;

public class GetSystemStatsQueryHandler : IRequestHandler<GetSystemStatsQuery, SystemStatsDto>
{
    private readonly IDapperContext _dapperContext;

    public GetSystemStatsQueryHandler(IDapperContext dapperContext)
    {
        _dapperContext = dapperContext;
    }

    public async Task<SystemStatsDto> Handle(GetSystemStatsQuery request, CancellationToken cancellationToken)
    {
        using var connection = _dapperContext.CreateConnection();
        
        var sql = @"
            SELECT 
                (SELECT COUNT(*) FROM Complaints) AS TotalComplaints,
                (SELECT COUNT(*) FROM Cases) AS TotalCases,
                (SELECT COUNT(*) FROM Users) AS TotalUsers,
                (SELECT COUNT(*) FROM Evidence) AS TotalEvidenceFiles
        ";

        var stats = await connection.QuerySingleAsync<SystemStatsDto>(sql);
        return stats;
    }
}