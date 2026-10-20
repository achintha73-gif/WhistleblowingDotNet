using MediatR;
using Whistleblowing.Application.Features.Cases.DTOs;

namespace Whistleblowing.Application.Features.Cases.Queries.GetCases;

public class GetCasesQuery : IRequest<List<CaseDto>>
{
    public string? Status { get; set; }
}