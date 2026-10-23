using MediatR;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.EntityFrameworkCore;
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

// Avoid Windows Event Log writes in local development
builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.AddDebug();

// Controllers
builder.Services.AddControllers();
builder.Services.AddHttpClient();
builder.Services.AddEndpointsApiExplorer();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins(
            "http://localhost:5173",
            "https://whistleblowing-dot-net.vercel.app/"
        )
        .AllowAnyHeader()
        .AllowAnyMethod();
    });
});

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
builder.Services.AddScoped<IEmailSender, SmtpEmailSender>();
var dataProtectionPath = Path.Combine(builder.Environment.ContentRootPath, "private-uploads", "data-protection-keys");
Directory.CreateDirectory(dataProtectionPath);
builder.Services.AddDataProtection().PersistKeysToFileSystem(new DirectoryInfo(dataProtectionPath));

// MediatR + Pipeline Behaviours
builder.Services.AddMediatR(cfg =>
{
    cfg.RegisterServicesFromAssembly(typeof(LoginCommand).Assembly);
    cfg.AddOpenBehavior(typeof(RequestLoggingBehaviour<,>));
    cfg.AddOpenBehavior(typeof(ValidationBehaviour<,>));
    cfg.AddOpenBehavior(typeof(ExceptionHandlingBehaviour<,>));
    cfg.AddOpenBehavior(typeof(TransactionBehaviour<,>));
});

// JWT Configuration
var jwtSecret = builder.Configuration["Jwt:Secret"]
    ?? throw new InvalidOperationException("JWT Secret missing in config.");
if (!builder.Environment.IsDevelopment() &&
    (jwtSecret.Length < 32 || jwtSecret == "REPLACE_THIS_WITH_A_STRONG_SECRET_KEY_AT_LEAST_32_CHARS_LONG_2026"))
    throw new InvalidOperationException("Configure a unique Jwt:Secret of at least 32 characters for production.");
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "WhistleblowingSystem";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "WhistleblowingSystemUsers";

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
    });

builder.Services.AddAuthorization();

// ICurrentUserService
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();

var app = builder.Build();

// 🌟 AUTO MIGRATE DATABASE (මේක තමයි අලුතෙන් දාන්නේ)
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<Whistleblowing.Infrastructure.Persistence.ApplicationDbContext>();
        await context.Database.MigrateAsync(); // Tables ටික හදනවා
        Console.WriteLine("✅ Database Migrated Successfully!");
    }
    catch (Exception ex)
    {
        Console.Error.WriteLine($"❌ Database Migration Failed: {ex.Message}");
    }
}

// Seed database
try
{
    await DataSeeder.SeedAsync(app.Services);
}
catch (Exception ex)
{
    Console.Error.WriteLine($"Database seeding failed: {ex}");
}

// Middleware
app.UseMiddleware<ExceptionHandlingMiddleware>();

// wwwroot folder
var wwwrootPath = Path.Combine(app.Environment.ContentRootPath, "wwwroot");
if (!Directory.Exists(wwwrootPath))
{
    Directory.CreateDirectory(wwwrootPath);
}

app.UseDefaultFiles();
app.UseStaticFiles();

app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();

app.UseCors("AllowReactApp");

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapFallbackToFile("index.html");

app.Run();