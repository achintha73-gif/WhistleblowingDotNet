using MediatR;
using Whistleblowing.Application.Features.Anonymous.DTOs;

namespace Whistleblowing.Application.Features.Anonymous.Queries.TrackComplaint;

public class GetComplaintByCodeQuery : IRequest<TrackComplaintDto?>
{
    public string ReferenceCode { get; set; } = string.Empty;

    public GetComplaintByCodeQuery(string referenceCode)
    {
        ReferenceCode = referenceCode;
    }
}