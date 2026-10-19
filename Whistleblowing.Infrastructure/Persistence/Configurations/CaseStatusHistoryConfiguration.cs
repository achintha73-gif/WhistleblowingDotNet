using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Whistleblowing.Domain.Entities;

namespace Whistleblowing.Infrastructure.Persistence.Configurations;

public class CaseStatusHistoryConfiguration : IEntityTypeConfiguration<CaseStatusHistory>
{
    public void Configure(EntityTypeBuilder<CaseStatusHistory> builder)
    {
        builder.ToTable("case_status_history");

        builder.HasKey(x => x.HistoryId);

        builder.Property(x => x.Status)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(x => x.ChangedAt).IsRequired();

        // Relations
        builder.HasOne(x => x.ChangedByUser)
            .WithMany(u => u.CaseStatusChanges)
            .HasForeignKey(x => x.ChangedBy)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Case)
            .WithMany(c => c.StatusHistory)
            .HasForeignKey(x => x.CaseId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(x => x.CaseId);
        builder.HasIndex(x => x.ChangedBy);
    }
}