using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options)
    : DbContext(options)
{
    public DbSet<User> Users => Set<User>();

    public DbSet<Role> Roles => Set<Role>();

    public DbSet<UserRole> UserRoles => Set<UserRole>();

    public DbSet<Address> Addresses => Set<Address>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        ConfigureUser(modelBuilder);
        ConfigureRole(modelBuilder);
        ConfigureUserRole(modelBuilder);
        ConfigureAddress(modelBuilder);
    }

    private static void ConfigureUser(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("users");

            entity.HasKey(user => user.Id);

            entity.Property(user => user.FirstName)
                .HasMaxLength(100)
                .IsRequired();

            entity.Property(user => user.LastName)
                .HasMaxLength(100)
                .IsRequired();

            entity.Property(user => user.Email)
                .HasMaxLength(256)
                .IsRequired();

            entity.Property(user => user.PasswordHash)
                .HasMaxLength(255)
                .IsRequired();

            entity.Property(user => user.PhoneNumber)
                .HasMaxLength(20);

            entity.HasIndex(user => user.Email)
                .IsUnique();
        });
    }

    private static void ConfigureRole(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Role>(entity =>
        {
            entity.ToTable("roles");

            entity.HasKey(role => role.Id);

            entity.Property(role => role.Name)
                .HasMaxLength(50)
                .IsRequired();

            entity.HasIndex(role => role.Name)
                .IsUnique();

            entity.HasData(
                new Role { Id = 1, Name = "Customer" },
                new Role { Id = 2, Name = "Merchant" },
                new Role { Id = 3, Name = "Driver" },
                new Role { Id = 4, Name = "Admin" }
            );
        });
    }

    private static void ConfigureUserRole(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<UserRole>(entity =>
        {
            entity.ToTable("user_roles");

            entity.HasKey(userRole => new
            {
                userRole.UserId,
                userRole.RoleId
            });

            entity.HasOne(userRole => userRole.User)
                .WithMany(user => user.UserRoles)
                .HasForeignKey(userRole => userRole.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(userRole => userRole.Role)
                .WithMany(role => role.UserRoles)
                .HasForeignKey(userRole => userRole.RoleId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }

    private static void ConfigureAddress(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Address>(entity =>
        {
            entity.ToTable("addresses");

            entity.HasKey(address => address.Id);

            entity.Property(address => address.Label)
                .HasMaxLength(50)
                .IsRequired();

            entity.Property(address => address.Street)
                .HasMaxLength(150)
                .IsRequired();

            entity.Property(address => address.ExteriorNumber)
                .HasMaxLength(20)
                .IsRequired();

            entity.Property(address => address.InteriorNumber)
                .HasMaxLength(20);

            entity.Property(address => address.Neighborhood)
                .HasMaxLength(100)
                .IsRequired();

            entity.Property(address => address.City)
                .HasMaxLength(100)
                .IsRequired();

            entity.Property(address => address.State)
                .HasMaxLength(100)
                .IsRequired();

            entity.Property(address => address.PostalCode)
                .HasMaxLength(10)
                .IsRequired();

            entity.Property(address => address.Country)
                .HasMaxLength(80)
                .IsRequired();

            entity.Property(address => address.References)
                .HasMaxLength(500);

            entity.Property(address => address.Latitude)
                .HasPrecision(10, 7);

            entity.Property(address => address.Longitude)
                .HasPrecision(10, 7);

            entity.HasOne(address => address.User)
                .WithMany(user => user.Addresses)
                .HasForeignKey(address => address.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(address => address.UserId);
        });
    }
}