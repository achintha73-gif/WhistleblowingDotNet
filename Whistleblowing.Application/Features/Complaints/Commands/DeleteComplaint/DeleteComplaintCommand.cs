using MediatR;

namespace Whistleblowing.Application.Features.Complaints.Commands.DeleteComplaint;

public class DeleteComplaintCommand : IRequest<Unit>
{
    public int ComplaintId { get; set; }

    public DeleteComplaintCommand(int complaintId)
    {
        ComplaintId = complaintId;
    }
}