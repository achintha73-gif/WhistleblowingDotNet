using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Whistleblowing.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class NullableSubmittedByInAdditionalInformation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int>(
                name: "SubmittedBy",
                table: "additional_information",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int>(
                name: "SubmittedBy",
                table: "additional_information",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);
        }
    }
}
