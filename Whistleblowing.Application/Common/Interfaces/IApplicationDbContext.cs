using Microsoft.EntityFrameworkCore;
using Whistleblowing.Domain.Entities;

namespace Whistleblowing.Application.Common.Interfaces;

/// <summary>
/// Abstraction over the application's database context.
/// Provides access to DbSets without coupling to Infrastructure.
/// </summary>
public interface IApplicationDbContext
{
    DbSet<Role> Roles { get; }
    DbSet<Department> Departments { get; }
    DbSet<User> Users { get; }
    DbSet<Complaint> Complaints { get; }
    DbSet<Case> Cases { get; }
    DbSet<Evidence> Evidence { get; }
    DbSet<InvestigationReport> InvestigationReports { get; }
    DbSet<CaseStatusHistory> CaseStatusHistories { get; }
    DbSet<AdditionalInformation> AdditionalInformations { get; }
    DbSet<Notification> Notifications { get; }
    DbSet<SystemSetting> SystemSettings { get; }
    DbSet<PasswordResetToken> PasswordResetTokens { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}