using MediatR;
using Microsoft.Extensions.Logging;
using System.Diagnostics;

namespace Whistleblowing.Application.Common.Behaviours;

public class RequestLoggingBehaviour<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    private readonly ILogger<RequestLoggingBehaviour<TRequest, TResponse>> _logger;

    public RequestLoggingBehaviour(ILogger<RequestLoggingBehaviour<TRequest, TResponse>> logger)
    {
        _logger = logger;
    }

    public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
    {
        var requestName = typeof(TRequest).Name;
        _logger.LogInformation("Handling Request: {Name} {@Request}", requestName, request);

        var timer = Stopwatch.StartNew();
        var response = await next();
        timer.Stop();

        _logger.LogInformation("Handled Request: {Name} in {ElapsedMilliseconds}ms", requestName, timer.ElapsedMilliseconds);
        return response;
    }
}