using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Whistleblowing.Domain.Entities;

namespace Whistleblowing.Infrastructure.Persistence.Configurations;

public class AdditionalInformationConfiguration : IEntityTypeConfiguration<AdditionalInformation>
{
    public void Configure(EntityTypeBuilder<AdditionalInformation> builder)
    {
        builder.ToTable("additional_information");

        builder.HasKey(x => x.InfoId);

        builder.Property(x => x.Title)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(x => x.Description)
            .IsRequired()
            .HasColumnType("text");

        builder.Property(x => x.InformationType)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(x => x.SubmittedAt).IsRequired();

        // Relations
        builder.HasOne(x => x.SubmittedByUser)
            .WithMany(u => u.AdditionalInfo)
            .HasForeignKey(x => x.SubmittedBy)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Complaint)
            .WithMany(c => c.AdditionalInfo)
            .HasForeignKey(x => x.ComplaintId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(x => x.ComplaintId);
        builder.HasIndex(x => x.SubmittedBy);
    }
}