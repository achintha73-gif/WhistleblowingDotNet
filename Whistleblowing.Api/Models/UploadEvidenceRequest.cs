using Microsoft.AspNetCore.Http;

namespace Whistleblowing.Api.Models;

public class UploadEvidenceRequest
{
    public IFormFile File { get; set; } = null!;
    public string? Description { get; set; }
}