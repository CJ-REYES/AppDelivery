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

    public DbSet<StoreCategory> StoreCategories => Set<StoreCategory>();

public DbSet<Store> Stores => Set<Store>();

public DbSet<ProductCategory> ProductCategories => Set<ProductCategory>();

public DbSet<Product> Products => Set<Product>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        ConfigureUser(modelBuilder);
        ConfigureRole(modelBuilder);
        ConfigureUserRole(modelBuilder);
        ConfigureAddress(modelBuilder);
        ConfigureStoreCategory(modelBuilder);
ConfigureStore(modelBuilder);
ConfigureProductCategory(modelBuilder);
ConfigureProduct(modelBuilder);
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
    private static void ConfigureStoreCategory(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<StoreCategory>(entity =>
    {
        entity.ToTable("store_categories");

        entity.HasKey(category => category.Id);

        entity.Property(category => category.Name)
            .HasMaxLength(100)
            .IsRequired();

        entity.Property(category => category.Slug)
            .HasMaxLength(120)
            .IsRequired();

        entity.Property(category => category.IconName)
            .HasMaxLength(80);

        entity.HasIndex(category => category.Slug)
            .IsUnique();

        entity.HasData(
            new StoreCategory
            {
                Id = 1,
                Name = "Restaurantes",
                Slug = "restaurantes",
                IconName = "utensils"
            },
            new StoreCategory
            {
                Id = 2,
                Name = "Supermercados",
                Slug = "supermercados",
                IconName = "shopping-cart"
            },
            new StoreCategory
            {
                Id = 3,
                Name = "Farmacias",
                Slug = "farmacias",
                IconName = "heart-pulse"
            },
            new StoreCategory
            {
                Id = 4,
                Name = "Tiendas",
                Slug = "tiendas",
                IconName = "store"
            },
            new StoreCategory
            {
                Id = 5,
                Name = "Postres",
                Slug = "postres",
                IconName = "ice-cream-bowl"
            }
        );
    });
}

private static void ConfigureStore(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Store>(entity =>
    {
        entity.ToTable("stores");

        entity.HasKey(store => store.Id);

        entity.Property(store => store.Name)
            .HasMaxLength(150)
            .IsRequired();

        entity.Property(store => store.Slug)
            .HasMaxLength(180)
            .IsRequired();

        entity.Property(store => store.Description)
            .HasMaxLength(1000)
            .IsRequired();

        entity.Property(store => store.PhoneNumber)
            .HasMaxLength(20)
            .IsRequired();

        entity.Property(store => store.Email)
            .HasMaxLength(256);

        entity.Property(store => store.LogoUrl)
            .HasMaxLength(2048);

        entity.Property(store => store.CoverImageUrl)
            .HasMaxLength(2048);

        entity.Property(store => store.Street)
            .HasMaxLength(150)
            .IsRequired();

        entity.Property(store => store.ExteriorNumber)
            .HasMaxLength(20)
            .IsRequired();

        entity.Property(store => store.InteriorNumber)
            .HasMaxLength(20);

        entity.Property(store => store.Neighborhood)
            .HasMaxLength(100)
            .IsRequired();

        entity.Property(store => store.City)
            .HasMaxLength(100)
            .IsRequired();

        entity.Property(store => store.State)
            .HasMaxLength(100)
            .IsRequired();

        entity.Property(store => store.PostalCode)
            .HasMaxLength(10)
            .IsRequired();

        entity.Property(store => store.Latitude)
            .HasPrecision(10, 7);

        entity.Property(store => store.Longitude)
            .HasPrecision(10, 7);

        entity.Property(store => store.DeliveryFee)
            .HasPrecision(10, 2);

        entity.Property(store => store.MinimumOrderAmount)
            .HasPrecision(10, 2);

        entity.Property(store => store.RatingAverage)
            .HasPrecision(3, 2);

        entity.HasIndex(store => store.Slug)
            .IsUnique();

        entity.HasIndex(store => store.OwnerId);

        entity.HasIndex(store => store.StoreCategoryId);

        entity.HasOne(store => store.Owner)
            .WithMany(user => user.OwnedStores)
            .HasForeignKey(store => store.OwnerId)
            .OnDelete(DeleteBehavior.Restrict);

        entity.HasOne(store => store.StoreCategory)
            .WithMany(category => category.Stores)
            .HasForeignKey(store => store.StoreCategoryId)
            .OnDelete(DeleteBehavior.Restrict);
    });
}

private static void ConfigureProductCategory(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<ProductCategory>(entity =>
    {
        entity.ToTable("product_categories");

        entity.HasKey(category => category.Id);

        entity.Property(category => category.Name)
            .HasMaxLength(100)
            .IsRequired();

        entity.Property(category => category.Slug)
            .HasMaxLength(120)
            .IsRequired();

        entity.HasIndex(category => new
        {
            category.StoreId,
            category.Slug
        })
        .IsUnique();

        entity.HasOne(category => category.Store)
            .WithMany(store => store.ProductCategories)
            .HasForeignKey(category => category.StoreId)
            .OnDelete(DeleteBehavior.Restrict);
    });
}

private static void ConfigureProduct(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Product>(entity =>
    {
        entity.ToTable("products");

        entity.HasKey(product => product.Id);

        entity.Property(product => product.Name)
            .HasMaxLength(150)
            .IsRequired();

        entity.Property(product => product.Description)
            .HasMaxLength(1000)
            .IsRequired();

        entity.Property(product => product.Price)
            .HasPrecision(10, 2);

        entity.Property(product => product.ImageUrl)
            .HasMaxLength(2048);

        entity.HasIndex(product => new
        {
            product.StoreId,
            product.IsAvailable
        });

        entity.HasIndex(product => product.ProductCategoryId);

        entity.HasOne(product => product.Store)
            .WithMany(store => store.Products)
            .HasForeignKey(product => product.StoreId)
            .OnDelete(DeleteBehavior.Restrict);

        entity.HasOne(product => product.ProductCategory)
            .WithMany(category => category.Products)
            .HasForeignKey(product => product.ProductCategoryId)
            .OnDelete(DeleteBehavior.Restrict);
    });
}
}