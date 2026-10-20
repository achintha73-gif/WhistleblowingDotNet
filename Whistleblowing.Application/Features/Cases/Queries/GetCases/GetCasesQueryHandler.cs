using Dapper;
using MediatR;
using Whistleblowing.Application.Common.Interfaces;
using Whistleblowing.Application.Features.Cases.DTOs;

namespace Whistleblowing.Application.Features.Cases.Queries.GetCases;

public class GetCasesQueryHandler : IRequestHandler<GetCasesQuery, List<CaseDto>>
{
    private readonly IDapperContext _dapperContext;
    private readonly ICurrentUserService _currentUser;

    public GetCasesQueryHandler(IDapperContext dapperContext, ICurrentUserService currentUser)
    {
        _dapperContext = dapperContext;
        _currentUser = currentUser;
    }

    public async Task<List<CaseDto>> Handle(GetCasesQuery request, CancellationToken cancellationToken)
    {
        using var connection = _dapperContext.CreateConnection();

        var sql = @"
            SELECT 
                c.CaseId, 
                c.ComplaintId, 
                comp.Title AS ComplaintTitle, 
                c.Status, 
                c.Priority, 
                c.AssignedInvestigatorId, 
                u.Name AS InvestigatorName, 
                c.CreatedAt, 
                c.UpdatedAt
            FROM Cases c
            INNER JOIN Complaints comp ON c.ComplaintId = comp.ComplaintId
            LEFT JOIN Users u ON c.AssignedInvestigatorId = u.UserId
            WHERE 1=1
        ";

        // Role-based filter
        if (_currentUser.Role == "INVESTIGATOR")
        {
            sql += " AND c.AssignedInvestigatorId = @UserId";
        }

        // Optional Status filter
        if (!string.IsNullOrEmpty(request.Status))
        {
            sql += " AND c.Status = @Status";
        }

        sql += " ORDER BY c.CreatedAt DESC";

        var parameters = new DynamicParameters();
        if (_currentUser.Role == "INVESTIGATOR")
            parameters.Add("@UserId", _currentUser.UserId);
        if (!string.IsNullOrEmpty(request.Status))
            parameters.Add("@Status", request.Status);

        // Dapper maps the results to List<CaseDto> automatically
        var cases = await connection.QueryAsync<CaseDto>(sql, parameters);

        return cases.ToList();
    }
}