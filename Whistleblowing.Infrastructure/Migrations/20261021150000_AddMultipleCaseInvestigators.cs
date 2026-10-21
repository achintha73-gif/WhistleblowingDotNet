using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Whistleblowing.Infrastructure.Persistence;

#nullable disable

namespace Whistleblowing.Infrastructure.Migrations;

[DbContext(typeof(ApplicationDbContext))]
[Migration("20261021150000_AddMultipleCaseInvestigators")]
public partial class AddMultipleCaseInvestigators : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "case_investigators",
            columns: table => new
            {
                CaseId = table.Column<int>(type: "int", nullable: false),
                InvestigatorId = table.Column<int>(type: "int", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_case_investigators", x => new { x.CaseId, x.InvestigatorId });
                table.ForeignKey(
                    name: "FK_case_investigators_cases_CaseId",
                    column: x => x.CaseId,
                    principalTable: "cases",
                    principalColumn: "CaseId",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_case_investigators_users_InvestigatorId",
                    column: x => x.InvestigatorId,
                    principalTable: "users",
                    principalColumn: "UserId",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateIndex(
            name: "IX_case_investigators_InvestigatorId",
            table: "case_investigators",
            column: "InvestigatorId");

        migrationBuilder.Sql("""
            INSERT INTO case_investigators (CaseId, InvestigatorId)
            SELECT c.CaseId, c.AssignedInvestigatorId
            FROM cases c
            WHERE c.AssignedInvestigatorId IS NOT NULL;
            """);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(name: "case_investigators");
    }
}
