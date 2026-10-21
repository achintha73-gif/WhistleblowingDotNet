using Microsoft.AspNetCore.Http;

namespace Whistleblowing.Api.Models;

public class UploadEvidenceRequest
{
    public IFormFile? File { get; set; }
    public string? Description { get; set; }
}
