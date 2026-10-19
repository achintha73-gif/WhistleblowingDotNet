using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Whistleblowing.Domain.Entities;

namespace Whistleblowing.Infrastructure.Persistence.Configurations;

public class DepartmentConfiguration : IEntityTypeConfiguration<Department>
{
    public void Configure(EntityTypeBuilder<Department> builder)
    {
        builder.ToTable("departments");

        builder.HasKey(x => x.DepartmentId);

        builder.Property(x => x.DepartmentName)
            .IsRequired()
            .HasMaxLength(150);

        builder.HasIndex(x => x.DepartmentName).IsUnique();

        builder.Property(x => x.Description)
            .HasColumnType("text");

        builder.Property(x => x.Status)
            .IsRequired()
            .HasMaxLength(20)
            .HasDefaultValue("active");

        builder.Property(x => x.CreatedAt).IsRequired();
        builder.Property(x => x.UpdatedAt).IsRequired();

        // Manager relationship (User is manager of department)
        builder.HasOne(x => x.Manager)
            .WithMany(u => u.ManagedDepartments)
            .HasForeignKey(x => x.ManagerId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(x => x.ManagerId);
    }
}