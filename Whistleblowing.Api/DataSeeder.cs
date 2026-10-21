using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Whistleblowing.Application.Common.Interfaces;
using Whistleblowing.Domain.Entities;
using Whistleblowing.Domain.Enums;

namespace Whistleblowing.Api;

public static class DataSeeder
{
    public static async Task SeedAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();
        var passwordHasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher>();

        // 1. Seed roles (if empty)
        if (!await context.Roles.AnyAsync())
        {
            context.Roles.AddRange(
                new Role { RoleName = "ADMIN", Description = "System Administrator" },
                new Role { RoleName = "MANAGER", Description = "Manager" },
                new Role { RoleName = "INVESTIGATOR", Description = "Investigator" },
                new Role { RoleName = "USER", Description = "Employee / Whistleblower" }
            );
            await context.SaveChangesAsync(default);
        }

        // 2. Seed a default department when starting with an empty database.
        if (!await context.Departments.AnyAsync())
        {
            context.Departments.Add(new Department
            {
                DepartmentName = "General",
                Description = "Default department",
                Status = "active"
            });
            await context.SaveChangesAsync(default);
        }

        // Keep common departments available on existing databases too.
        var existingDepartmentNames = await context.Departments
            .Select(department => department.DepartmentName)
            .ToListAsync();
        var knownDepartmentNames = existingDepartmentNames.ToHashSet(StringComparer.OrdinalIgnoreCase);
        var defaultDepartments = new[]
        {
            new Department { DepartmentName = "IT", Description = "Information Technology", Status = "active" },
            new Department { DepartmentName = "HR", Description = "Human Resources", Status = "active" },
            new Department { DepartmentName = "Finance", Description = "Finance and accounting", Status = "active" },
            new Department { DepartmentName = "Legal", Description = "Legal and compliance", Status = "active" },
            new Department { DepartmentName = "Operations", Description = "Business operations", Status = "active" }
        };

        var missingDepartments = defaultDepartments
            .Where(department => knownDepartmentNames.Add(department.DepartmentName))
            .ToArray();
        if (missingDepartments.Length > 0)
        {
            context.Departments.AddRange(missingDepartments);
            await context.SaveChangesAsync(default);
        }

        // 3. Seed users (if empty)
        if (!await context.Users.AnyAsync())
        {
            var adminRole = await context.Roles.FirstAsync(r => r.RoleName == "ADMIN");
            var managerRole = await context.Roles.FirstAsync(r => r.RoleName == "MANAGER");
            var investigatorRole = await context.Roles.FirstAsync(r => r.RoleName == "INVESTIGATOR");
            var userRole = await context.Roles.FirstAsync(r => r.RoleName == "USER");
            var generalDept = await context.Departments.FirstAsync();

            context.Users.AddRange(
                new User
                {
                    Name = "System Admin",
                    Email = "admin@wb.local",
                    Password = passwordHasher.Hash("Admin@12345"),
                    RoleId = adminRole.RoleId,
                    DepartmentId = null,
                    Status = UserStatus.ACTIVE
                },
                new User
                {
                    Name = "Maria Manager",
                    Email = "manager@wb.local",
                    Password = passwordHasher.Hash("Manager@12345"),
                    RoleId = managerRole.RoleId,
                    DepartmentId = generalDept.DepartmentId,
                    Status = UserStatus.ACTIVE
                },
                new User
                {
                    Name = "Ivan Investigator",
                    Email = "investigator@wb.local",
                    Password = passwordHasher.Hash("Investigator@12345"),
                    RoleId = investigatorRole.RoleId,
                    DepartmentId = generalDept.DepartmentId,
                    Status = UserStatus.ACTIVE
                },
                new User
                {
                    Name = "Eve Employee",
                    Email = "employee@wb.local",
                    Password = passwordHasher.Hash("Employee@12345"),
                    RoleId = userRole.RoleId,
                    DepartmentId = generalDept.DepartmentId,
                    Status = UserStatus.ACTIVE
                }
            );
            await context.SaveChangesAsync(default);
        }

        if (!await context.SystemSettings.AnyAsync())
        {
            context.SystemSettings.AddRange(
                new SystemSetting { Key = "AnonymousSubmissionsEnabled", Value = "true", Description = "Allow people without an account to submit anonymous concerns." },
                new SystemSetting { Key = "DefaultCasePriority", Value = "MEDIUM", Description = "Priority selected by default when a concern becomes an investigation case." },
                new SystemSetting { Key = "EvidenceMaxFileSizeMb", Value = "10", Description = "Maximum size for a single evidence attachment, from 1 to 25 MB." },
                new SystemSetting { Key = "OrganizationName", Value = "Whistleblowing System", Description = "Organization name shown in the application header and page titles." },
                new SystemSetting { Key = "SupportEmail", Value = "support@wb.local", Description = "Optional support email shown on the Support page." },
                new SystemSetting { Key = "SupportPhone", Value = "+94 11 245 7839", Description = "Optional support phone shown on the Support page." }
            );
            await context.SaveChangesAsync(default);
        }

        // Keep sample complaint and investigation data out of production databases.
        var environment = scope.ServiceProvider.GetRequiredService<IWebHostEnvironment>();
        if (environment.IsDevelopment() &&
            !await context.Complaints.AnyAsync(item => item.Title == "[TEST] Procurement concern"))
        {
            var employee = await context.Users
                .Where(item => item.Role.RoleName == "USER" && item.Status == UserStatus.ACTIVE)
                .OrderBy(item => item.UserId)
                .FirstOrDefaultAsync();
            var investigator = await context.Users
                .Where(item => item.Role.RoleName == "INVESTIGATOR" && item.Status == UserStatus.ACTIVE)
                .OrderBy(item => item.UserId)
                .FirstOrDefaultAsync();
            if (employee is not null && investigator is not null)
            {
                var now = DateTime.UtcNow;
                var complaint = new Complaint
                {
                    Title = "[TEST] Procurement concern",
                    Description = "DEMO DATA: A test report about a fictional procurement process. No real person or organization is involved.",
                    Category = "Procurement",
                    Status = ComplaintStatus.CONVERTED_TO_CASE,
                    UserId = employee.UserId,
                    CreatedAt = now.AddDays(-2),
                    UpdatedAt = now.AddDays(-1)
                };
                context.Complaints.Add(complaint);
                await context.SaveChangesAsync(default);

                var caseRecord = new Case
                {
                    ComplaintId = complaint.ComplaintId,
                    Status = CaseStatus.PENDING_REVIEW,
                    Priority = CasePriority.MEDIUM,
                    AssignedInvestigatorId = investigator.UserId,
                    CreatedAt = now.AddDays(-1),
                    UpdatedAt = now
                };
                context.Cases.Add(caseRecord);
                await context.SaveChangesAsync(default);

                context.InvestigationReports.Add(new InvestigationReport
                {
                    CaseId = caseRecord.CaseId,
                    Findings = "DEMO REPORT: The fictional test documents contain inconsistent approval dates. This is sample content only.",
                    Recommendation = "DEMO RECOMMENDATION: Review the fictional approval checklist and record the outcome.",
                    CreatedAt = now
                });
                await context.SaveChangesAsync(default);
            }
        }
    }
}
