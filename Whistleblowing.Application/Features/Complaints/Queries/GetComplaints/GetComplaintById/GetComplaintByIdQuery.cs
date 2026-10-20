using MediatR;
using Whistleblowing.Application.Features.Complaints.DTOs;

namespace Whistleblowing.Application.Features.Complaints.Queries.GetComplaintById;

public class GetComplaintByIdQuery : IRequest<ComplaintDto?>
{
    public int ComplaintId { get; set; }

    public GetComplaintByIdQuery(int complaintId)
    {
        ComplaintId = complaintId;
    }
}