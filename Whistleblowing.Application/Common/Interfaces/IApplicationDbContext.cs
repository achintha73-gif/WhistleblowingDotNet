using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Whistleblowing.Domain.Entities;

namespace Whistleblowing.Application.Common.Interfaces;

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

    // අලුතෙන් එකතු කළා (Transaction Behaviour එකට ඕන)
    DatabaseFacade Database { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}