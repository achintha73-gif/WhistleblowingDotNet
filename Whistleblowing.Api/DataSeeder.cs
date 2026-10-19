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

        // 2. Seed department (if empty)
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
    }
}