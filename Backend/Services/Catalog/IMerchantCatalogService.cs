using Backend.Contracts.Catalog;

namespace Backend.Services.Catalog;

public interface IMerchantCatalogService
{
    Task<StoreDetailResponse> GetStoreAsync(
        Guid ownerId,
        CancellationToken cancellationToken
    );

    Task<StoreDetailResponse> CreateStoreAsync(
        Guid ownerId,
        SaveStoreRequest request,
        CancellationToken cancellationToken
    );

    Task<StoreDetailResponse> UpdateStoreAsync(
        Guid ownerId,
        SaveStoreRequest request,
        CancellationToken cancellationToken
    );

    Task DeactivateStoreAsync(
        Guid ownerId,
        CancellationToken cancellationToken
    );

    Task<IReadOnlyCollection<ProductCategoryResponse>> GetCategoriesAsync(
        Guid ownerId,
        CancellationToken cancellationToken
    );

    Task<ProductCategoryResponse> CreateCategoryAsync(
        Guid ownerId,
        SaveProductCategoryRequest request,
        CancellationToken cancellationToken
    );

    Task<ProductCategoryResponse> UpdateCategoryAsync(
        Guid ownerId,
        Guid categoryId,
        SaveProductCategoryRequest request,
        CancellationToken cancellationToken
    );

    Task DeleteCategoryAsync(
        Guid ownerId,
        Guid categoryId,
        CancellationToken cancellationToken
    );

    Task<IReadOnlyCollection<ProductResponse>> GetProductsAsync(
        Guid ownerId,
        CancellationToken cancellationToken
    );

    Task<ProductResponse> CreateProductAsync(
        Guid ownerId,
        SaveProductRequest request,
        CancellationToken cancellationToken
    );

    Task<ProductResponse> UpdateProductAsync(
        Guid ownerId,
        Guid productId,
        SaveProductRequest request,
        CancellationToken cancellationToken
    );

    Task DeleteProductAsync(
        Guid ownerId,
        Guid productId,
        CancellationToken cancellationToken
    );
}
