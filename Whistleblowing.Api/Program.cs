using MediatR;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using System.Text;
using Whistleblowing.Api;
using Whistleblowing.Api.Middleware;
using Whistleblowing.Api.Services;
using Whistleblowing.Application.Common.Behaviours; 
using Whistleblowing.Application.Common.Interfaces;
using Whistleblowing.Application.Features.Auth.Commands.Login;
using Whistleblowing.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

// Controllers
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// Swagger with JWT support
builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter JWT token (from /api/auth/login response)."
    });

    options.AddSecurityRequirement(document => new OpenApiSecurityRequirement
    {
        [new OpenApiSecuritySchemeReference("Bearer", document)] = new List<string>()
    });
});

// Infrastructure (DbContext, JwtTokenGenerator, PasswordHasher)
builder.Services.AddInfrastructure(builder.Configuration);

// MediatR + Pipeline Behaviours
builder.Services.AddMediatR(cfg =>
{
    cfg.RegisterServicesFromAssembly(typeof(LoginCommand).Assembly);

    // 1. Request Logging Behaviour (හැම request එකක්ම log වෙන්න)
    cfg.AddOpenBehavior(typeof(RequestLoggingBehaviour<,>));

    // 2. Validation Behaviour (Validation error එහෙම ආවොත් block කරන්න)
    cfg.AddOpenBehavior(typeof(ValidationBehaviour<,>));

    // 3. Exception Handling Behaviour (Errors ටික catch කරන්න)
    cfg.AddOpenBehavior(typeof(ExceptionHandlingBehaviour<,>));

    // 4. Transaction Behaviour (SaveChanges එකක් තිබ්බොත් Transaction එකක් අරින්න)
    cfg.AddOpenBehavior(typeof(TransactionBehaviour<,>));
});

// JWT Configuration
var jwtSecret = builder.Configuration["Jwt:Secret"]
    ?? throw new InvalidOperationException("JWT Secret missing in config.");
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "WhistleblowingSystem";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "WhistleblowingSystemUsers";

// 🔍 DEBUG: Verify secret is loaded correctly
Console.WriteLine("========================================");
Console.WriteLine($"[PROGRAM] Jwt:Secret length = {jwtSecret.Length}");
Console.WriteLine($"[PROGRAM] Jwt:Secret = {jwtSecret}");
Console.WriteLine($"[PROGRAM] Jwt:Issuer = {jwtIssuer}");
Console.WriteLine($"[PROGRAM] Jwt:Audience = {jwtAudience}");
Console.WriteLine("========================================");

// JWT Authentication
builder.Services
    .AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
            ClockSkew = TimeSpan.Zero
        };

        // 🔍 DEBUG: Log auth failures
        options.Events = new JwtBearerEvents
        {
            OnAuthenticationFailed = context =>
            {
                Console.WriteLine("========================================");
                Console.WriteLine($"[AUTH FAILED] {context.Exception.GetType().Name}");
                Console.WriteLine($"[AUTH FAILED] Message: {context.Exception.Message}");
                Console.WriteLine("========================================");
                return Task.CompletedTask;
            },
            OnTokenValidated = context =>
            {
                Console.WriteLine("[AUTH SUCCESS] Token validated");
                return Task.CompletedTask;
            },
            OnChallenge = context =>
            {
                Console.WriteLine($"[AUTH CHALLENGE] {context.ErrorDescription}");
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization();

// ICurrentUserService
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();

var app = builder.Build();

// Seed database
try
{
    await DataSeeder.SeedAsync(app.Services);
}
catch (Exception ex)
{
    var logger = app.Services.GetRequiredService<ILogger<Program>>();
    logger.LogError(ex, "Seeding failed");
}

// Middleware
app.UseMiddleware<ExceptionHandlingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();