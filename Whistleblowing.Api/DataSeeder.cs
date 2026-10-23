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

        var environment = scope.ServiceProvider.GetRequiredService<IWebHostEnvironment>();
        var configuration = scope.ServiceProvider.GetRequiredService<IConfiguration>();

        // Production requires an explicitly configured administrator; never create demo accounts.
        if (!environment.IsDevelopment() && !await context.Users.AnyAsync())
        {
            var email = configuration["Seed:AdminEmail"]?.Trim();
            var password = configuration["Seed:AdminPassword"];
            if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password) || password.Length < 12)
                throw new InvalidOperationException("Set Seed:AdminEmail and a unique Seed:AdminPassword of at least 12 characters before creating the first administrator.");
            var role = await context.Roles.FirstAsync(r => r.RoleName == "ADMIN");
            context.Users.Add(new User { Name = "System Admin", Email = email, Password = passwordHasher.Hash(password), RoleId = role.RoleId, Status = UserStatus.ACTIVE });
            await context.SaveChangesAsync(default);
        }

        // Default demo accounts are only created during local development.
        if (environment.IsDevelopment() && !await context.Users.AnyAsync())
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

        if (environment.IsDevelopment())
        {
            await SeedDevelopmentSampleDataAsync(context, passwordHasher);
        }
    }

    private static async Task SeedDevelopmentSampleDataAsync(
        IApplicationDbContext context,
        IPasswordHasher passwordHasher)
    {
        var sampleDepartments = new[]
        {
            new Department
            {
                DepartmentName = "Procurement",
                Description = "DEMO DATA: Fictional procurement team.",
                Status = "active"
            },
            new Department
            {
                DepartmentName = "Facilities",
                Description = "DEMO DATA: Fictional facilities team.",
                Status = "active"
            },
            new Department
            {
                DepartmentName = "Compliance",
                Description = "DEMO DATA: Fictional compliance team.",
                Status = "active"
            }
        };

        var existingDepartmentNames = await context.Departments
            .Select(department => department.DepartmentName)
            .ToListAsync();
        var knownDepartmentNames = existingDepartmentNames.ToHashSet(StringComparer.OrdinalIgnoreCase);
        var missingDepartments = sampleDepartments
            .Where(department => knownDepartmentNames.Add(department.DepartmentName))
            .ToArray();

        if (missingDepartments.Length > 0)
        {
            context.Departments.AddRange(missingDepartments);
            await context.SaveChangesAsync(default);
        }

        var sampleDepartmentNames = sampleDepartments
            .Select(department => department.DepartmentName)
            .ToArray();
        var departmentIds = await context.Departments
            .Where(department => sampleDepartmentNames.Contains(department.DepartmentName))
            .ToDictionaryAsync(department => department.DepartmentName, department => department.DepartmentId);

        var roleIds = await context.Roles
            .Where(role => role.RoleName == "USER" || role.RoleName == "MANAGER" || role.RoleName == "INVESTIGATOR")
            .ToDictionaryAsync(role => role.RoleName, role => role.RoleId);

        var sampleUserDefinitions = new[]
        {
            new
            {
                Name = "Demo Employee",
                Email = "demo.employee@wb.local",
                RoleName = "USER",
                DepartmentName = "Procurement"
            },
            new
            {
                Name = "Demo Investigator",
                Email = "demo.investigator@wb.local",
                RoleName = "INVESTIGATOR",
                DepartmentName = "Facilities"
            },
            new
            {
                Name = "Demo Manager",
                Email = "demo.manager@wb.local",
                RoleName = "MANAGER",
                DepartmentName = "Compliance"
            }
        };

        var sampleEmails = sampleUserDefinitions.Select(user => user.Email).ToArray();
        var existingSampleUsers = await context.Users
            .Where(user => sampleEmails.Contains(user.Email))
            .ToListAsync();
        var knownEmails = existingSampleUsers
            .Select(user => user.Email)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);
        var missingUserDefinitions = sampleUserDefinitions
            .Where(user => knownEmails.Add(user.Email))
            .ToArray();

        if (missingUserDefinitions.Length > 0)
        {
            var missingUsers = missingUserDefinitions.Select(user => new User
            {
                Name = user.Name,
                Email = user.Email,
                Password = passwordHasher.Hash("Demo@12345"),
                RoleId = roleIds[user.RoleName],
                DepartmentId = departmentIds[user.DepartmentName],
                Status = UserStatus.ACTIVE
            });
            context.Users.AddRange(missingUsers);
            await context.SaveChangesAsync(default);
        }

        var demoUsers = await context.Users
            .Where(user => sampleEmails.Contains(user.Email))
            .ToDictionaryAsync(user => user.Email);
        var investigatorId = demoUsers["demo.investigator@wb.local"].UserId;
        var employeeId = demoUsers["demo.employee@wb.local"].UserId;

        var sampleComplaints = new[]
        {
            new
            {
                Title = "[DEMO] Vendor selection concern",
                Description = "DEMO DATA: A fictional report asks whether a vendor selection followed the sample organization's documented review steps.",
                Category = "Procurement",
                Status = ComplaintStatus.CONVERTED_TO_CASE,
                UserId = (int?)employeeId,
                IsAnonymous = false,
                ReferenceCode = (string?)null,
                CaseStatus = (CaseStatus?)CaseStatus.INVESTIGATING,
                Priority = CasePriority.HIGH,
                Findings = (string?)"DEMO REPORT: The fictional review packet is missing one approval note. No real person or organization is involved.",
                Recommendation = (string?)"DEMO RECOMMENDATION: Confirm the example approval sequence and document any control improvements.",
                DaysAgo = 5
            },
            new
            {
                Title = "[DEMO] Facilities safety follow-up",
                Description = "DEMO DATA: A fictional employee requests a follow-up on a routine facilities safety inspection.",
                Category = "Workplace Safety",
                Status = ComplaintStatus.CONVERTED_TO_CASE,
                UserId = (int?)employeeId,
                IsAnonymous = false,
                ReferenceCode = (string?)null,
                CaseStatus = (CaseStatus?)CaseStatus.PENDING_REVIEW,
                Priority = CasePriority.MEDIUM,
                Findings = (string?)"DEMO REPORT: The fictional inspection checklist records that the identified item was addressed.",
                Recommendation = (string?)"DEMO RECOMMENDATION: Have a reviewer confirm the checklist and close the sample follow-up if complete.",
                DaysAgo = 3
            },
            new
            {
                Title = "[DEMO] Policy clarification request",
                Description = "DEMO DATA: A fictional employee asks for clarification about an internal policy and its approval process.",
                Category = "Policy",
                Status = ComplaintStatus.UNDER_REVIEW,
                UserId = (int?)employeeId,
                IsAnonymous = false,
                ReferenceCode = (string?)null,
                CaseStatus = (CaseStatus?)null,
                Priority = CasePriority.LOW,
                Findings = (string?)null,
                Recommendation = (string?)null,
                DaysAgo = 2
            },
            new
            {
                Title = "[DEMO] Anonymous office access concern",
                Description = "DEMO DATA: A fictional anonymous report asks for a routine review of an office access log.",
                Category = "Facilities",
                Status = ComplaintStatus.PENDING,
                UserId = (int?)null,
                IsAnonymous = true,
                ReferenceCode = (string?)"DEMO-ANON-2026-01",
                CaseStatus = (CaseStatus?)null,
                Priority = CasePriority.MEDIUM,
                Findings = (string?)null,
                Recommendation = (string?)null,
                DaysAgo = 1
            },
            new
            {
                Title = "[DEMO] Expense review concern",
                Description = "DEMO DATA: A fictional report requests a routine check of a sample expense review workflow.",
                Category = "Compliance",
                Status = ComplaintStatus.CONVERTED_TO_CASE,
                UserId = (int?)employeeId,
                IsAnonymous = false,
                ReferenceCode = (string?)null,
                CaseStatus = (CaseStatus?)CaseStatus.OPEN,
                Priority = CasePriority.MEDIUM,
                Findings = (string?)null,
                Recommendation = (string?)null,
                DaysAgo = 7
            }
        };

        var now = DateTime.UtcNow;
        foreach (var sample in sampleComplaints)
        {
            var complaint = await context.Complaints
                .FirstOrDefaultAsync(item => item.Title == sample.Title);

            if (complaint is null)
            {
                complaint = new Complaint
                {
                    Title = sample.Title,
                    Description = sample.Description,
                    Category = sample.Category,
                    Status = sample.Status,
                    UserId = sample.UserId,
                    IsAnonymous = sample.IsAnonymous,
                    ReferenceCode = sample.ReferenceCode,
                    CreatedAt = now.AddDays(-sample.DaysAgo),
                    UpdatedAt = now.AddDays(-sample.DaysAgo)
                };
                context.Complaints.Add(complaint);
                await context.SaveChangesAsync(default);
            }

            if (sample.CaseStatus is null)
            {
                continue;
            }

            var caseRecord = await context.Cases
                .FirstOrDefaultAsync(item => item.ComplaintId == complaint.ComplaintId);
            if (caseRecord is null)
            {
                caseRecord = new Case
                {
                    ComplaintId = complaint.ComplaintId,
                    Status = sample.CaseStatus.Value,
                    Priority = sample.Priority,
                    AssignedInvestigatorId = investigatorId,
                    CreatedAt = now.AddDays(-sample.DaysAgo + 1),
                    UpdatedAt = now
                };
                context.Cases.Add(caseRecord);
                await context.SaveChangesAsync(default);
            }

            if (!await context.CaseInvestigators.AnyAsync(assignment =>
                    assignment.CaseId == caseRecord.CaseId &&
                    assignment.InvestigatorId == investigatorId))
            {
                context.CaseInvestigators.Add(new CaseInvestigator
                {
                    CaseId = caseRecord.CaseId,
                    InvestigatorId = investigatorId
                });
                await context.SaveChangesAsync(default);
            }

            if (sample.Findings is not null &&
                sample.Recommendation is not null &&
                !await context.InvestigationReports.AnyAsync(report => report.CaseId == caseRecord.CaseId))
            {
                context.InvestigationReports.Add(new InvestigationReport
                {
                    CaseId = caseRecord.CaseId,
                    Findings = sample.Findings,
                    Recommendation = sample.Recommendation,
                    CreatedAt = now
                });
                await context.SaveChangesAsync(default);
            }
        }
    }
}
