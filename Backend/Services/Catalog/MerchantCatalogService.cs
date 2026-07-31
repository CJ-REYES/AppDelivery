using Backend.Contracts.Catalog;
using Backend.Data;
using Backend.Middleware.Exceptions;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services.Catalog;

public sealed class MerchantCatalogService(
    AppDbContext database,
    TimeProvider timeProvider
) : IMerchantCatalogService
{
    public async Task<StoreDetailResponse> GetStoreAsync(
        Guid ownerId,
        CancellationToken cancellationToken
    )
    {
        var store = await FindOwnedStoreAsync(
            ownerId,
            asTracking: false,
            cancellationToken
        );

        return CatalogMapper.ToDetail(store);
    }

    public async Task<StoreDetailResponse> CreateStoreAsync(
        Guid ownerId,
        SaveStoreRequest request,
        CancellationToken cancellationToken
    )
    {
        if (await database.Stores.AnyAsync(
            store => store.OwnerId == ownerId,
            cancellationToken
        ))
        {
            throw new ConflictApiException(
                "La cuenta ya tiene un comercio registrado.",
                "merchant_store_already_exists"
            );
        }

        ValidateDeliveryWindow(request);
        var storeCategory = await FindStoreCategoryAsync(
            request.StoreCategoryId,
            cancellationToken
        );
        var merchantRole = await database.Roles.SingleOrDefaultAsync(
            role => role.Name == "Merchant",
            cancellationToken
        ) ?? throw new InvalidOperationException(
            "No se encontró el rol Merchant en la base de datos."
        );
        var utcNow = timeProvider.GetUtcNow().UtcDateTime;
        var store = new Store
        {
            OwnerId = ownerId,
            StoreCategoryId = storeCategory.Id,
            StoreCategory = storeCategory,
            Slug = await CreateStoreSlugAsync(
                request.Name,
                currentStoreId: null,
                cancellationToken
            ),
            CreatedAt = utcNow,
            UpdatedAt = utcNow,
            IsActive = true
        };

        Apply(request, store);
        database.Stores.Add(store);

        if (!await database.UserRoles.AnyAsync(
            userRole =>
                userRole.UserId == ownerId
                && userRole.RoleId == merchantRole.Id,
            cancellationToken
        ))
        {
            database.UserRoles.Add(new UserRole
            {
                UserId = ownerId,
                RoleId = merchantRole.Id,
                AssignedAt = utcNow
            });
        }

        await SaveChangesWithConflictHandlingAsync(cancellationToken);
        return CatalogMapper.ToDetail(store);
    }

    public async Task<StoreDetailResponse> UpdateStoreAsync(
        Guid ownerId,
        SaveStoreRequest request,
        CancellationToken cancellationToken
    )
    {
        ValidateDeliveryWindow(request);
        var store = await FindOwnedStoreAsync(
            ownerId,
            asTracking: true,
            cancellationToken
        );
        var storeCategory = await FindStoreCategoryAsync(
            request.StoreCategoryId,
            cancellationToken
        );

        if (!string.Equals(
            store.Name.Trim(),
            request.Name.Trim(),
            StringComparison.Ordinal
        ))
        {
            store.Slug = await CreateStoreSlugAsync(
                request.Name,
                store.Id,
                cancellationToken
            );
        }

        Apply(request, store);
        store.StoreCategory = storeCategory;
        store.StoreCategoryId = storeCategory.Id;
        store.UpdatedAt = timeProvider.GetUtcNow().UtcDateTime;

        await SaveChangesWithConflictHandlingAsync(cancellationToken);
        return CatalogMapper.ToDetail(store);
    }

    public async Task DeactivateStoreAsync(
        Guid ownerId,
        CancellationToken cancellationToken
    )
    {
        var store = await FindOwnedStoreAsync(
            ownerId,
            asTracking: true,
            cancellationToken
        );

        store.IsActive = false;
        store.IsOpen = false;
        store.UpdatedAt = timeProvider.GetUtcNow().UtcDateTime;
        await database.SaveChangesAsync(cancellationToken);
    }

    public async Task<IReadOnlyCollection<ProductCategoryResponse>>
        GetCategoriesAsync(
            Guid ownerId,
            CancellationToken cancellationToken
        )
    {
        var storeId = await GetOwnedStoreIdAsync(ownerId, cancellationToken);
        var categories = await database.ProductCategories
            .AsNoTracking()
            .Where(category => category.StoreId == storeId)
            .OrderBy(category => category.DisplayOrder)
            .ThenBy(category => category.Name)
            .ToListAsync(cancellationToken);

        return categories.Select(CatalogMapper.ToResponse).ToArray();
    }

    public async Task<ProductCategoryResponse> CreateCategoryAsync(
        Guid ownerId,
        SaveProductCategoryRequest request,
        CancellationToken cancellationToken
    )
    {
        var storeId = await GetOwnedStoreIdAsync(ownerId, cancellationToken);
        var category = new ProductCategory
        {
            StoreId = storeId,
            Name = request.Name.Trim(),
            Slug = await CreateCategorySlugAsync(
                storeId,
                request.Name,
                currentCategoryId: null,
                cancellationToken
            ),
            DisplayOrder = request.DisplayOrder,
            IsActive = request.IsActive
        };

        database.ProductCategories.Add(category);
        await SaveChangesWithConflictHandlingAsync(cancellationToken);
        return CatalogMapper.ToResponse(category);
    }

    public async Task<ProductCategoryResponse> UpdateCategoryAsync(
        Guid ownerId,
        Guid categoryId,
        SaveProductCategoryRequest request,
        CancellationToken cancellationToken
    )
    {
        var storeId = await GetOwnedStoreIdAsync(ownerId, cancellationToken);
        var category = await database.ProductCategories.SingleOrDefaultAsync(
            entity =>
                entity.Id == categoryId
                && entity.StoreId == storeId,
            cancellationToken
        ) ?? throw new NotFoundApiException(
            "No se encontró la categoría solicitada."
        );

        category.Name = request.Name.Trim();
        category.Slug = await CreateCategorySlugAsync(
            storeId,
            request.Name,
            category.Id,
            cancellationToken
        );
        category.DisplayOrder = request.DisplayOrder;
        category.IsActive = request.IsActive;

        await SaveChangesWithConflictHandlingAsync(cancellationToken);
        return CatalogMapper.ToResponse(category);
    }

    public async Task DeleteCategoryAsync(
        Guid ownerId,
        Guid categoryId,
        CancellationToken cancellationToken
    )
    {
        var storeId = await GetOwnedStoreIdAsync(ownerId, cancellationToken);
        var category = await database.ProductCategories.SingleOrDefaultAsync(
            entity =>
                entity.Id == categoryId
                && entity.StoreId == storeId,
            cancellationToken
        ) ?? throw new NotFoundApiException(
            "No se encontró la categoría solicitada."
        );

        if (await database.Products.AnyAsync(
            product => product.ProductCategoryId == categoryId,
            cancellationToken
        ))
        {
            throw new ConflictApiException(
                "No puedes eliminar una categoría que todavía tiene productos.",
                "product_category_not_empty"
            );
        }

        database.ProductCategories.Remove(category);
        await database.SaveChangesAsync(cancellationToken);
    }

    public async Task<IReadOnlyCollection<ProductResponse>> GetProductsAsync(
        Guid ownerId,
        CancellationToken cancellationToken
    )
    {
        var storeId = await GetOwnedStoreIdAsync(ownerId, cancellationToken);
        var products = await database.Products
            .AsNoTracking()
            .Include(product => product.ProductCategory)
            .Where(product => product.StoreId == storeId)
            .OrderBy(product => product.ProductCategory.DisplayOrder)
            .ThenBy(product => product.Name)
            .ToListAsync(cancellationToken);

        return products.Select(CatalogMapper.ToResponse).ToArray();
    }

    public async Task<ProductResponse> CreateProductAsync(
        Guid ownerId,
        SaveProductRequest request,
        CancellationToken cancellationToken
    )
    {
        var storeId = await GetOwnedStoreIdAsync(ownerId, cancellationToken);
        var category = await FindOwnedCategoryAsync(
            storeId,
            request.ProductCategoryId,
            cancellationToken
        );
        var utcNow = timeProvider.GetUtcNow().UtcDateTime;
        var product = new Product
        {
            StoreId = storeId,
            ProductCategoryId = category.Id,
            ProductCategory = category,
            CreatedAt = utcNow,
            UpdatedAt = utcNow
        };

        Apply(request, product);
        database.Products.Add(product);
        await database.SaveChangesAsync(cancellationToken);
        return CatalogMapper.ToResponse(product);
    }

    public async Task<ProductResponse> UpdateProductAsync(
        Guid ownerId,
        Guid productId,
        SaveProductRequest request,
        CancellationToken cancellationToken
    )
    {
        var storeId = await GetOwnedStoreIdAsync(ownerId, cancellationToken);
        var product = await database.Products
            .Include(entity => entity.ProductCategory)
            .SingleOrDefaultAsync(
                entity =>
                    entity.Id == productId
                    && entity.StoreId == storeId,
                cancellationToken
            ) ?? throw new NotFoundApiException(
                "No se encontró el producto solicitado."
            );
        var category = await FindOwnedCategoryAsync(
            storeId,
            request.ProductCategoryId,
            cancellationToken
        );

        Apply(request, product);
        product.ProductCategoryId = category.Id;
        product.ProductCategory = category;
        product.UpdatedAt = timeProvider.GetUtcNow().UtcDateTime;
        await database.SaveChangesAsync(cancellationToken);
        return CatalogMapper.ToResponse(product);
    }

    public async Task DeleteProductAsync(
        Guid ownerId,
        Guid productId,
        CancellationToken cancellationToken
    )
    {
        var storeId = await GetOwnedStoreIdAsync(ownerId, cancellationToken);
        var product = await database.Products.SingleOrDefaultAsync(
            entity =>
                entity.Id == productId
                && entity.StoreId == storeId,
            cancellationToken
        ) ?? throw new NotFoundApiException(
            "No se encontró el producto solicitado."
        );

        database.Products.Remove(product);

        try
        {
            await database.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException)
        {
            throw new ConflictApiException(
                "El producto forma parte de pedidos existentes y no puede eliminarse.",
                "product_in_use"
            );
        }
    }

    private async Task<Store> FindOwnedStoreAsync(
        Guid ownerId,
        bool asTracking,
        CancellationToken cancellationToken
    )
    {
        IQueryable<Store> query = database.Stores
            .Include(store => store.StoreCategory)
            .Include(store => store.ProductCategories);

        if (!asTracking)
        {
            query = query.AsNoTracking();
        }

        return await query.SingleOrDefaultAsync(
            store => store.OwnerId == ownerId,
            cancellationToken
        ) ?? throw new NotFoundApiException(
            "No se encontró un comercio asociado a la cuenta."
        );
    }

    private async Task<Guid> GetOwnedStoreIdAsync(
        Guid ownerId,
        CancellationToken cancellationToken
    )
    {
        var storeId = await database.Stores
            .Where(store => store.OwnerId == ownerId)
            .Select(store => (Guid?)store.Id)
            .SingleOrDefaultAsync(cancellationToken);

        return storeId ?? throw new NotFoundApiException(
            "No se encontró un comercio asociado a la cuenta."
        );
    }

    private async Task<StoreCategory> FindStoreCategoryAsync(
        int categoryId,
        CancellationToken cancellationToken
    ) =>
        await database.StoreCategories.SingleOrDefaultAsync(
            category =>
                category.Id == categoryId
                && category.IsActive,
            cancellationToken
        ) ?? throw new BadRequestApiException(
            "La categoría seleccionada no está disponible.",
            "invalid_store_category"
        );

    private async Task<ProductCategory> FindOwnedCategoryAsync(
        Guid storeId,
        Guid categoryId,
        CancellationToken cancellationToken
    ) =>
        await database.ProductCategories.SingleOrDefaultAsync(
            category =>
                category.Id == categoryId
                && category.StoreId == storeId,
            cancellationToken
        ) ?? throw new BadRequestApiException(
            "La categoría de producto no pertenece al comercio.",
            "invalid_product_category"
        );

    private async Task<string> CreateStoreSlugAsync(
        string name,
        Guid? currentStoreId,
        CancellationToken cancellationToken
    )
    {
        var baseSlug = SlugGenerator.From(name);
        var usedSlugs = await database.Stores
            .Where(store =>
                store.Id != currentStoreId
                && store.Slug.StartsWith(baseSlug)
            )
            .Select(store => store.Slug)
            .ToListAsync(cancellationToken);

        return CreateAvailableSlug(baseSlug, usedSlugs);
    }

    private async Task<string> CreateCategorySlugAsync(
        Guid storeId,
        string name,
        Guid? currentCategoryId,
        CancellationToken cancellationToken
    )
    {
        var baseSlug = SlugGenerator.From(name);
        var usedSlugs = await database.ProductCategories
            .Where(category =>
                category.StoreId == storeId
                && category.Id != currentCategoryId
                && category.Slug.StartsWith(baseSlug)
            )
            .Select(category => category.Slug)
            .ToListAsync(cancellationToken);

        return CreateAvailableSlug(baseSlug, usedSlugs);
    }

    private static string CreateAvailableSlug(
        string baseSlug,
        IReadOnlyCollection<string> usedSlugs
    )
    {
        var used = usedSlugs.ToHashSet(StringComparer.OrdinalIgnoreCase);
        if (!used.Contains(baseSlug))
        {
            return baseSlug;
        }

        var suffix = 2;
        while (used.Contains($"{baseSlug}-{suffix}"))
        {
            suffix++;
        }

        return $"{baseSlug}-{suffix}";
    }

    private static void ValidateDeliveryWindow(SaveStoreRequest request)
    {
        if (request.EstimatedDeliveryMinutesMin
            > request.EstimatedDeliveryMinutesMax)
        {
            throw new BadRequestApiException(
                "El tiempo mínimo de entrega no puede superar al máximo.",
                "invalid_delivery_window"
            );
        }
    }

    private static void Apply(SaveStoreRequest request, Store store)
    {
        store.Name = request.Name.Trim();
        store.Description = request.Description.Trim();
        store.PhoneNumber = request.PhoneNumber.Trim();
        store.Email = NormalizeOptional(request.Email)?.ToLowerInvariant();
        store.LogoUrl = NormalizeOptional(request.LogoUrl);
        store.CoverImageUrl = NormalizeOptional(request.CoverImageUrl);
        store.Street = request.Street.Trim();
        store.ExteriorNumber = request.ExteriorNumber.Trim();
        store.InteriorNumber = NormalizeOptional(request.InteriorNumber);
        store.Neighborhood = request.Neighborhood.Trim();
        store.City = request.City.Trim();
        store.State = request.State.Trim();
        store.PostalCode = request.PostalCode.Trim();
        store.Latitude = request.Latitude;
        store.Longitude = request.Longitude;
        store.DeliveryFee = request.DeliveryFee;
        store.MinimumOrderAmount = request.MinimumOrderAmount;
        store.EstimatedDeliveryMinutesMin =
            request.EstimatedDeliveryMinutesMin;
        store.EstimatedDeliveryMinutesMax =
            request.EstimatedDeliveryMinutesMax;
        store.IsOpen = request.IsOpen;
    }

    private static void Apply(SaveProductRequest request, Product product)
    {
        product.Name = request.Name.Trim();
        product.Description = request.Description.Trim();
        product.Price = request.Price;
        product.ImageUrl = NormalizeOptional(request.ImageUrl);
        product.IsAvailable = request.IsAvailable;
        product.IsFeatured = request.IsFeatured;
        product.StockQuantity = request.StockQuantity;
        product.PreparationTimeMinutes = request.PreparationTimeMinutes;
    }

    private async Task SaveChangesWithConflictHandlingAsync(
        CancellationToken cancellationToken
    )
    {
        try
        {
            await database.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException)
        {
            throw new ConflictApiException(
                "No fue posible guardar los cambios porque existe información duplicada.",
                "catalog_duplicate"
            );
        }
    }

    private static string? NormalizeOptional(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
