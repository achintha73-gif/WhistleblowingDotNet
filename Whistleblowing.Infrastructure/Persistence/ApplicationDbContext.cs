using Microsoft.EntityFrameworkCore;
using Whistleblowing.Domain.Entities;

namespace Whistleblowing.Infrastructure.Persistence;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    // DbSets — one per entity
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<Department> Departments => Set<Department>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Complaint> Complaints => Set<Complaint>();
    public DbSet<Case> Cases => Set<Case>();
    public DbSet<Evidence> Evidence => Set<Evidence>();
    public DbSet<InvestigationReport> InvestigationReports => Set<InvestigationReport>();
    public DbSet<CaseStatusHistory> CaseStatusHistories => Set<CaseStatusHistory>();
    public DbSet<AdditionalInformation> AdditionalInformations => Set<AdditionalInformation>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<SystemSetting> SystemSettings => Set<SystemSetting>();
    public DbSet<PasswordResetToken> PasswordResetTokens => Set<PasswordResetToken>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Apply all IEntityTypeConfiguration classes from this assembly
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
    }
}