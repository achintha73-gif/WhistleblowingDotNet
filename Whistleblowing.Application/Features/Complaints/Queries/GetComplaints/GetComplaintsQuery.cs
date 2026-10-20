using MediatR;
using Whistleblowing.Application.Features.Complaints.DTOs;

namespace Whistleblowing.Application.Features.Complaints.Queries.GetComplaints;

public class GetComplaintsQuery : IRequest<List<ComplaintDto>>
{
    /// <summary>
    /// Optional status filter (PENDING, UNDER_REVIEW, etc.)
    /// </summary>
    public string? Status { get; set; }
}