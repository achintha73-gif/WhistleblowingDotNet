using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Whistleblowing.Application.Common.Interfaces;
using Whistleblowing.Infrastructure.Persistence;
using Whistleblowing.Infrastructure.Services;

namespace Whistleblowing.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration
    )
    {
        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseSqlServer(
                configuration.GetConnectionString("DefaultConnection")
            ));

        services.AddScoped<IApplicationDbContext>(provider =>
            provider.GetRequiredService<ApplicationDbContext>());

        services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();
        services.AddScoped<IPasswordHasher, BCryptPasswordHasher>();
        services.AddScoped<IFileStorageService, LocalFileStorageService>();
        
        // 👉 මේකයි අපේ අලුත් Dapper Registration එක
        services.AddSingleton<IDapperContext, DapperContext>();

        return services;
    }
}