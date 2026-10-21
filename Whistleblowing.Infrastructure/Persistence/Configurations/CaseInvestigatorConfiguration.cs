using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Whistleblowing.Domain.Entities;

namespace Whistleblowing.Infrastructure.Persistence.Configurations;

public class CaseInvestigatorConfiguration : IEntityTypeConfiguration<CaseInvestigator>
{
    public void Configure(EntityTypeBuilder<CaseInvestigator> builder)
    {
        builder.ToTable("case_investigators");
        builder.HasKey(assignment => new { assignment.CaseId, assignment.InvestigatorId });

        builder.HasOne(assignment => assignment.Case)
            .WithMany(caseRecord => caseRecord.InvestigatorAssignments)
            .HasForeignKey(assignment => assignment.CaseId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(assignment => assignment.Investigator)
            .WithMany(user => user.CaseAssignments)
            .HasForeignKey(assignment => assignment.InvestigatorId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(assignment => assignment.InvestigatorId);
    }
}
