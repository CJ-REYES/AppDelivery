using Backend.Contracts.Catalog;

namespace Backend.Services.Catalog;

public interface ICatalogService
{
    Task<IReadOnlyCollection<StoreCategoryResponse>> GetStoreCategoriesAsync(
        CancellationToken cancellationToken
    );

    Task<IReadOnlyCollection<StoreSummaryResponse>> SearchStoresAsync(
        string? search,
        int? storeCategoryId,
        bool openOnly,
        CancellationToken cancellationToken
    );

    Task<StoreDetailResponse> GetStoreAsync(
        Guid storeId,
        CancellationToken cancellationToken
    );

    Task<IReadOnlyCollection<ProductResponse>> GetProductsAsync(
        Guid storeId,
        string? search,
        Guid? productCategoryId,
        CancellationToken cancellationToken
    );
}
