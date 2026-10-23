using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Whistleblowing.Application.Features.Anonymous.Commands.AddAnonymousInfo;
using Whistleblowing.Application.Features.Anonymous.Commands.SubmitAnonymous;
using Whistleblowing.Application.Features.Anonymous.Queries.TrackComplaint;

namespace Whistleblowing.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[AllowAnonymous]
public class AnonymousController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IConfiguration _configuration;
    private readonly IHttpClientFactory _httpClientFactory;

    public AnonymousController(IMediator mediator, IConfiguration configuration, IHttpClientFactory httpClientFactory)
    {
        _mediator = mediator;
        _configuration = configuration;
        _httpClientFactory = httpClientFactory;
    }

    [HttpGet("captcha-config")]
    public IActionResult CaptchaConfig()
    {
        var siteKey = _configuration["Recaptcha:SiteKey"];
        return string.IsNullOrWhiteSpace(siteKey) ? StatusCode(503, new { error = "Verification is not configured." }) : Ok(new { siteKey });
    }

    [HttpPost("report")]
    public async Task<IActionResult> Report([FromBody] SubmitAnonymousCommand command)
    {
        var secret = _configuration["Recaptcha:SecretKey"];
        if (string.IsNullOrWhiteSpace(secret)) return StatusCode(503, new { error = "Verification is not configured." });
        if (string.IsNullOrWhiteSpace(command.RecaptchaToken)) return BadRequest(new { error = "Please complete the verification." });
        try
        {
            using var content = new FormUrlEncodedContent(new Dictionary<string, string> { ["secret"] = secret, ["response"] = command.RecaptchaToken });
            using var response = await _httpClientFactory.CreateClient().PostAsync("https://www.google.com/recaptcha/api/siteverify", content, HttpContext.RequestAborted);
            if (!response.IsSuccessStatusCode) return StatusCode(503, new { error = "Verification is temporarily unavailable." });
            using var json = System.Text.Json.JsonDocument.Parse(await response.Content.ReadAsStringAsync(HttpContext.RequestAborted));
            if (!json.RootElement.TryGetProperty("success", out var success) || success.ValueKind != System.Text.Json.JsonValueKind.True)
                return BadRequest(new { error = "Verification failed or expired. Please try again." });
        }
        catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException or System.Text.Json.JsonException)
        {
            return StatusCode(503, new { error = "Verification is temporarily unavailable." });
        }
        var result = await _mediator.Send(command);
        return CreatedAtAction(nameof(Track), new { code = result.ReferenceCode }, result);
    }

    [HttpGet("track/{code}")]
    public async Task<IActionResult> Track([FromRoute] string code)
    {
        var dto = await _mediator.Send(new GetComplaintByCodeQuery(code));

        if (dto is null)
        {
            return NotFound(new { error = "Invalid reference code." });
        }

        return Ok(dto);
    }

    [HttpPost("add-info")]
    public async Task<IActionResult> AddInfo([FromBody] AddAnonymousInfoCommand command)
    {
        var result = await _mediator.Send(command);
        
        // null return වුනොත් 404 දෙන්න (API crash නොවෙන්න)
        if (result is null)
        {
            return NotFound(new { error = "Invalid reference code." });
        }

        return Ok(result);
    }
}