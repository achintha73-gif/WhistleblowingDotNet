using MediatR;
using Microsoft.Extensions.Logging;

namespace Whistleblowing.Application.Common.Behaviours;

public class ExceptionHandlingBehaviour<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    private readonly ILogger<ExceptionHandlingBehaviour<TRequest, TResponse>> _logger;

    public ExceptionHandlingBehaviour(ILogger<ExceptionHandlingBehaviour<TRequest, TResponse>> logger)
    {
        _logger = logger;
    }

    public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
    {
        try
        {
            return await next();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled Exception for Request {Name} {@Request}", typeof(TRequest).Name, request);
            throw;
        }
    }
}