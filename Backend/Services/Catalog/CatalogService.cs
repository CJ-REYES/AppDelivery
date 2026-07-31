using Backend.Contracts.Catalog;
using Backend.Data;
using Backend.Middleware.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services.Catalog;

public sealed class CatalogService(AppDbContext database) : ICatalogService
{
    public async Task<IReadOnlyCollection<StoreCategoryResponse>>
        GetStoreCategoriesAsync(CancellationToken cancellationToken)
    {
        var categories = await database.StoreCategories
            .AsNoTracking()
            .Where(category => category.IsActive)
            .OrderBy(category => category.Name)
            .ToListAsync(cancellationToken);

        return categories.Select(CatalogMapper.ToResponse).ToArray();
    }

    public async Task<IReadOnlyCollection<StoreSummaryResponse>>
        SearchStoresAsync(
            string? search,
            int? storeCategoryId,
            bool openOnly,
            CancellationToken cancellationToken
        )
    {
        var query = database.Stores
            .AsNoTracking()
            .Include(store => store.StoreCategory)
            .Where(store =>
                store.IsActive
                && store.StoreCategory.IsActive
            );

        if (storeCategoryId is not null)
        {
            query = query.Where(store =>
                store.StoreCategoryId == storeCategoryId.Value
            );
        }

        if (openOnly)
        {
            query = query.Where(store => store.IsOpen);
        }

        var normalizedSearch = NormalizeSearch(search);
        if (normalizedSearch is not null)
        {
            var searchTerm = normalizedSearch.ToLowerInvariant();
            query = query.Where(store =>
                store.Name.ToLower().Contains(searchTerm)
                || store.Description.ToLower().Contains(searchTerm)
                || store.StoreCategory.Name.ToLower().Contains(searchTerm)
                || store.Products.Any(product =>
                    product.IsAvailable
                    && product.StockQuantity > 0
                    && product.ProductCategory.IsActive
                    && (
                        product.Name.ToLower().Contains(searchTerm)
                        || product.Description.ToLower().Contains(searchTerm)
                    )
                )
            );
        }

        var stores = await query
            .OrderByDescending(store => store.IsOpen)
            .ThenByDescending(store => store.RatingAverage)
            .ThenBy(store => store.Name)
            .ToListAsync(cancellationToken);

        return stores.Select(CatalogMapper.ToSummary).ToArray();
    }

    public async Task<StoreDetailResponse> GetStoreAsync(
        Guid storeId,
        CancellationToken cancellationToken
    )
    {
        var store = await database.Stores
            .AsNoTracking()
            .Include(entity => entity.StoreCategory)
            .Include(entity => entity.ProductCategories.Where(
                category => category.IsActive
            ))
            .SingleOrDefaultAsync(
                entity =>
                    entity.Id == storeId
                    && entity.IsActive
                    && entity.StoreCategory.IsActive,
                cancellationToken
            ) ?? throw new NotFoundApiException(
                "No se encontró el comercio solicitado."
            );

        return CatalogMapper.ToDetail(store);
    }

    public async Task<IReadOnlyCollection<ProductResponse>> GetProductsAsync(
        Guid storeId,
        string? search,
        Guid? productCategoryId,
        CancellationToken cancellationToken
    )
    {
        var storeExists = await database.Stores
            .AsNoTracking()
            .AnyAsync(
                store =>
                    store.Id == storeId
                    && store.IsActive
                    && store.StoreCategory.IsActive,
                cancellationToken
            );

        if (!storeExists)
        {
            throw new NotFoundApiException(
                "No se encontró el comercio solicitado."
            );
        }

        var query = database.Products
            .AsNoTracking()
            .Include(product => product.ProductCategory)
            .Where(product =>
                product.StoreId == storeId
                && product.IsAvailable
                && product.StockQuantity > 0
                && product.ProductCategory.IsActive
            );

        if (productCategoryId is not null)
        {
            query = query.Where(product =>
                product.ProductCategoryId == productCategoryId.Value
            );
        }

        var normalizedSearch = NormalizeSearch(search);
        if (normalizedSearch is not null)
        {
            var searchTerm = normalizedSearch.ToLowerInvariant();
            query = query.Where(product =>
                product.Name.ToLower().Contains(searchTerm)
                || product.Description.ToLower().Contains(searchTerm)
            );
        }

        var products = await query
            .OrderBy(product => product.ProductCategory.DisplayOrder)
            .ThenByDescending(product => product.IsFeatured)
            .ThenBy(product => product.Name)
            .ToListAsync(cancellationToken);

        return products.Select(CatalogMapper.ToResponse).ToArray();
    }

    private static string? NormalizeSearch(string? value)
    {
        var normalized = value?.Trim();
        return string.IsNullOrWhiteSpace(normalized) ? null : normalized;
    }
}
