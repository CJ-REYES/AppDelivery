using System;
using Backend.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Data.Migrations;

[DbContext(typeof(AppDbContext))]
[Migration("20260730120000_AddAuthCore")]
public partial class AddAuthCore : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "password_reset_tokens",
            columns: table => new
            {
                Id = table.Column<Guid>(
                    type: "char(36)",
                    nullable: false,
                    collation: "ascii_general_ci"
                ),
                UserId = table.Column<Guid>(
                    type: "char(36)",
                    nullable: false,
                    collation: "ascii_general_ci"
                ),
                TokenHash = table.Column<string>(
                    type: "varchar(64)",
                    maxLength: 64,
                    nullable: false
                )
                .Annotation("MySql:CharSet", "utf8mb4"),
                CreatedAt = table.Column<DateTime>(
                    type: "datetime(6)",
                    nullable: false
                ),
                ExpiresAt = table.Column<DateTime>(
                    type: "datetime(6)",
                    nullable: false
                ),
                UsedAt = table.Column<DateTime>(
                    type: "datetime(6)",
                    nullable: true
                )
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_password_reset_tokens", x => x.Id);
                table.ForeignKey(
                    name: "FK_password_reset_tokens_users_UserId",
                    column: x => x.UserId,
                    principalTable: "users",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade
                );
            }
        )
        .Annotation("MySql:CharSet", "utf8mb4");

        migrationBuilder.CreateTable(
            name: "refresh_tokens",
            columns: table => new
            {
                Id = table.Column<Guid>(
                    type: "char(36)",
                    nullable: false,
                    collation: "ascii_general_ci"
                ),
                UserId = table.Column<Guid>(
                    type: "char(36)",
                    nullable: false,
                    collation: "ascii_general_ci"
                ),
                TokenHash = table.Column<string>(
                    type: "varchar(64)",
                    maxLength: 64,
                    nullable: false
                )
                .Annotation("MySql:CharSet", "utf8mb4"),
                ReplacedByTokenHash = table.Column<string>(
                    type: "varchar(64)",
                    maxLength: 64,
                    nullable: true
                )
                .Annotation("MySql:CharSet", "utf8mb4"),
                CreatedAt = table.Column<DateTime>(
                    type: "datetime(6)",
                    nullable: false
                ),
                ExpiresAt = table.Column<DateTime>(
                    type: "datetime(6)",
                    nullable: false
                ),
                RevokedAt = table.Column<DateTime>(
                    type: "datetime(6)",
                    nullable: true
                )
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_refresh_tokens", x => x.Id);
                table.ForeignKey(
                    name: "FK_refresh_tokens_users_UserId",
                    column: x => x.UserId,
                    principalTable: "users",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade
                );
            }
        )
        .Annotation("MySql:CharSet", "utf8mb4");

        migrationBuilder.CreateIndex(
            name: "IX_password_reset_tokens_TokenHash",
            table: "password_reset_tokens",
            column: "TokenHash",
            unique: true
        );

        migrationBuilder.CreateIndex(
            name: "IX_password_reset_tokens_UserId_ExpiresAt",
            table: "password_reset_tokens",
            columns: new[] { "UserId", "ExpiresAt" }
        );

        migrationBuilder.CreateIndex(
            name: "IX_refresh_tokens_TokenHash",
            table: "refresh_tokens",
            column: "TokenHash",
            unique: true
        );

        migrationBuilder.CreateIndex(
            name: "IX_refresh_tokens_UserId_ExpiresAt",
            table: "refresh_tokens",
            columns: new[] { "UserId", "ExpiresAt" }
        );
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(name: "password_reset_tokens");
        migrationBuilder.DropTable(name: "refresh_tokens");
    }
}
