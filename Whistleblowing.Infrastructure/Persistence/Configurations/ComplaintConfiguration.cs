using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Whistleblowing.Domain.Entities;

namespace Whistleblowing.Infrastructure.Persistence.Configurations;

public class ComplaintConfiguration : IEntityTypeConfiguration<Complaint>
{
    public void Configure(EntityTypeBuilder<Complaint> builder)
    {
        builder.ToTable("complaints");

        builder.HasKey(x => x.ComplaintId);

        builder.Property(x => x.Title)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(x => x.Description)
            .IsRequired()
            .HasColumnType("text");

        builder.Property(x => x.Category)
            .HasMaxLength(100);

        builder.Property(x => x.Status)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(x => x.IsAnonymous)
            .IsRequired()
            .HasDefaultValue(false);

        builder.Property(x => x.ReferenceCode)
            .HasMaxLength(20);

        builder.HasIndex(x => x.ReferenceCode).IsUnique();

        builder.Property(x => x.CreatedAt).IsRequired();
        builder.Property(x => x.UpdatedAt).IsRequired();

        // Relations
        builder.HasOne(x => x.User)
            .WithMany(u => u.Complaints)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.SetNull);

        // Indexes
        builder.HasIndex(x => x.UserId);
        builder.HasIndex(x => x.Status);
    }
}