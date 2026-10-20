using MediatR;
using Whistleblowing.Application.Features.Complaints.DTOs;

namespace Whistleblowing.Application.Features.Complaints.Commands.CreateComplaint;

public class CreateComplaintCommand : IRequest<ComplaintDto>
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? Category { get; set; }
    public bool IsAnonymous { get; set; } = false;
}