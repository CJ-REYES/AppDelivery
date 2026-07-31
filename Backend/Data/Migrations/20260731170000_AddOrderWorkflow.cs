using Backend.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Data.Migrations;

[DbContext(typeof(AppDbContext))]
[Migration("20260731170000_AddOrderWorkflow")]
public sealed class AddOrderWorkflow : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<int>(
            name: "StockQuantity",
            table: "products",
            type: "int",
            nullable: false,
            defaultValue: 100
        );

        migrationBuilder.CreateTable(
            name: "order_status_history",
            columns: table => new
            {
                Id = table.Column<Guid>(
                    type: "char(36)",
                    nullable: false,
                    collation: "ascii_general_ci"
                ),
                OrderId = table.Column<Guid>(
                    type: "char(36)",
                    nullable: false,
                    collation: "ascii_general_ci"
                ),
                Status = table.Column<string>(
                    type: "varchar(30)",
                    maxLength: 30,
                    nullable: false
                )
                    .Annotation(
                        "MySql:CharSet",
                        "utf8mb4"
                    ),
                ChangedByUserId = table.Column<Guid>(
                    type: "char(36)",
                    nullable: true,
                    collation: "ascii_general_ci"
                ),
                ChangedByRole = table.Column<string>(
                    type: "varchar(30)",
                    maxLength: 30,
                    nullable: false
                )
                    .Annotation(
                        "MySql:CharSet",
                        "utf8mb4"
                    ),
                Note = table.Column<string>(
                    type: "varchar(500)",
                    maxLength: 500,
                    nullable: true
                )
                    .Annotation(
                        "MySql:CharSet",
                        "utf8mb4"
                    ),
                CreatedAt = table.Column<DateTime>(
                    type: "datetime(6)",
                    nullable: false
                )
            },
            constraints: table =>
            {
                table.PrimaryKey(
                    "PK_order_status_history",
                    entity => entity.Id
                );
                table.ForeignKey(
                    name: "FK_order_status_history_orders_OrderId",
                    column: entity => entity.OrderId,
                    principalTable: "orders",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade
                );
            }
        )
            .Annotation("MySql:CharSet", "utf8mb4");

        migrationBuilder.CreateIndex(
            name: "IX_order_status_history_OrderId_CreatedAt",
            table: "order_status_history",
            columns: new[] { "OrderId", "CreatedAt" }
        );
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(name: "order_status_history");

        migrationBuilder.DropColumn(
            name: "StockQuantity",
            table: "products"
        );
    }
}
