using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Whistleblowing.Domain.Entities;

namespace Whistleblowing.Infrastructure.Persistence.Configurations;

public class RoleConfiguration : IEntityTypeConfiguration<Role>
{
    public void Configure(EntityTypeBuilder<Role> builder)
    {
        builder.ToTable("roles");

        builder.HasKey(x => x.RoleId);

        builder.Property(x => x.RoleName)
            .IsRequired()
            .HasMaxLength(50);

        builder.HasIndex(x => x.RoleName).IsUnique();

        builder.Property(x => x.Description)
            .HasColumnType("text");

        builder.Property(x => x.CreatedAt)
            .IsRequired();

        builder.Property(x => x.UpdatedAt)
            .IsRequired();
    }
}