using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Whistleblowing.Domain.Entities;

namespace Whistleblowing.Infrastructure.Persistence.Configurations;

public class CaseConfiguration : IEntityTypeConfiguration<Case>
{
    public void Configure(EntityTypeBuilder<Case> builder)
    {
        builder.ToTable("cases");

        builder.HasKey(x => x.CaseId);

        builder.Property(x => x.Status)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(x => x.Priority)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(x => x.CreatedAt).IsRequired();
        builder.Property(x => x.UpdatedAt).IsRequired();

        // One-to-One with Complaint — Restrict (not Cascade) to avoid multiple cascade paths
        builder.HasOne(x => x.Complaint)
            .WithOne(c => c.Case)
            .HasForeignKey<Case>(x => x.ComplaintId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => x.ComplaintId).IsUnique();

        // Investigator relation
        builder.HasOne(x => x.AssignedInvestigator)
            .WithMany(u => u.AssignedCases)
            .HasForeignKey(x => x.AssignedInvestigatorId)
            .OnDelete(DeleteBehavior.SetNull);

        // Indexes
        builder.HasIndex(x => x.AssignedInvestigatorId);
        builder.HasIndex(x => x.Status);
    }
}