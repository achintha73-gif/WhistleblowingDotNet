using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Whistleblowing.Domain.Entities;

namespace Whistleblowing.Infrastructure.Persistence.Configurations;

public class EvidenceConfiguration : IEntityTypeConfiguration<Evidence>
{
    public void Configure(EntityTypeBuilder<Evidence> builder)
    {
        builder.ToTable("evidence");

        builder.HasKey(x => x.EvidenceId);

        builder.Property(x => x.FileName)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(x => x.FileType)
            .IsRequired()
            .HasMaxLength(150);

        builder.Property(x => x.FilePath)
            .HasMaxLength(500);

        builder.Property(x => x.Description)
            .HasColumnType("text");

        builder.Property(x => x.UploadedAt).IsRequired();

        // Relations - Case (optional)
        builder.HasOne(x => x.Case)
            .WithMany(c => c.Evidence)
            .HasForeignKey(x => x.CaseId)
            .OnDelete(DeleteBehavior.Cascade);

        // Relations - Complaint (Restrict to avoid multiple cascade paths)
        builder.HasOne(x => x.Complaint)
            .WithMany(c => c.Evidence)
            .HasForeignKey(x => x.ComplaintId)
            .OnDelete(DeleteBehavior.Restrict);

        // Relations - Uploader (optional)
        builder.HasOne(x => x.Uploader)
            .WithMany(u => u.UploadedEvidence)
            .HasForeignKey(x => x.UploadedBy)
            .OnDelete(DeleteBehavior.SetNull);

        // Indexes
        builder.HasIndex(x => x.CaseId);
        builder.HasIndex(x => x.ComplaintId);
        builder.HasIndex(x => x.UploadedBy);
    }
}