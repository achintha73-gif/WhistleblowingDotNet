using MediatR;
using Whistleblowing.Domain.Enums;

namespace Whistleblowing.Application.Features.Cases.Commands.ConvertComplaint;

public class ConvertComplaintCommand : IRequest<int>
{
    public int ComplaintId { get; set; }
    public CasePriority Priority { get; set; } = CasePriority.MEDIUM;
}

public class ConvertComplaintResponse
{
    public int CaseId { get; set; }
    public string Message { get; set; } = string.Empty;
}