using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Whistleblowing.Domain.Entities;

namespace Whistleblowing.Infrastructure.Persistence.Configurations;

public class InvestigationReportConfiguration : IEntityTypeConfiguration<InvestigationReport>
{
    public void Configure(EntityTypeBuilder<InvestigationReport> builder)
    {
        builder.ToTable("investigation_reports");

        builder.HasKey(x => x.ReportId);

        builder.Property(x => x.Findings)
            .IsRequired()
            .HasColumnType("text");

        builder.Property(x => x.Recommendation)
            .IsRequired()
            .HasColumnType("text");

        builder.Property(x => x.CreatedAt).IsRequired();

        // One-to-One with Case
        builder.HasOne(x => x.Case)
            .WithOne(c => c.InvestigationReport)
            .HasForeignKey<InvestigationReport>(x => x.CaseId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(x => x.CaseId).IsUnique();
    }
}