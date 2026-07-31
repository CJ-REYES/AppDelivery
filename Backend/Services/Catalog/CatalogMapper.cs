using Backend.Contracts.Catalog;
using Backend.Models;

namespace Backend.Services.Catalog;

internal static class CatalogMapper
{
    public static StoreCategoryResponse ToResponse(StoreCategory category) =>
        new(category.Id, category.Name, category.Slug, category.IconName);

    public static ProductCategoryResponse ToResponse(
        ProductCategory category
    ) =>
        new(
            category.Id,
            category.Name,
            category.Slug,
            category.DisplayOrder,
            category.IsActive
        );

    public static ProductResponse ToResponse(Product product) =>
        new(
            product.Id,
            product.StoreId,
            product.ProductCategoryId,
            product.ProductCategory.Name,
            product.Name,
            product.Description,
            product.Price,
            product.ImageUrl,
            product.IsAvailable,
            product.IsFeatured,
            product.StockQuantity,
            product.PreparationTimeMinutes,
            product.CreatedAt,
            product.UpdatedAt
        );

    public static StoreSummaryResponse ToSummary(Store store) =>
        new(
            store.Id,
            store.StoreCategoryId,
            store.StoreCategory.Name,
            store.StoreCategory.Slug,
            store.Name,
            store.Slug,
            store.Description,
            store.LogoUrl,
            store.CoverImageUrl,
            store.DeliveryFee,
            store.MinimumOrderAmount,
            store.EstimatedDeliveryMinutesMin,
            store.EstimatedDeliveryMinutesMax,
            store.RatingAverage,
            store.RatingCount,
            store.IsOpen
        );

    public static StoreDetailResponse ToDetail(Store store) =>
        new(
            store.Id,
            store.StoreCategoryId,
            store.StoreCategory.Name,
            store.StoreCategory.Slug,
            store.Name,
            store.Slug,
            store.Description,
            store.PhoneNumber,
            store.Email,
            store.LogoUrl,
            store.CoverImageUrl,
            store.Street,
            store.ExteriorNumber,
            store.InteriorNumber,
            store.Neighborhood,
            store.City,
            store.State,
            store.PostalCode,
            store.Latitude,
            store.Longitude,
            store.DeliveryFee,
            store.MinimumOrderAmount,
            store.EstimatedDeliveryMinutesMin,
            store.EstimatedDeliveryMinutesMax,
            store.RatingAverage,
            store.RatingCount,
            store.IsOpen,
            store.IsActive,
            store.CreatedAt,
            store.UpdatedAt,
            store.ProductCategories
                .OrderBy(category => category.DisplayOrder)
                .ThenBy(category => category.Name)
                .Select(ToResponse)
                .ToArray()
        );
}
