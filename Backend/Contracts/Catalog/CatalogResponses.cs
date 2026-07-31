namespace Backend.Contracts.Catalog;

public sealed record StoreCategoryResponse(
    int Id,
    string Name,
    string Slug,
    string? IconName
);

public sealed record ProductCategoryResponse(
    Guid Id,
    string Name,
    string Slug,
    int DisplayOrder,
    bool IsActive
);

public sealed record ProductResponse(
    Guid Id,
    Guid StoreId,
    Guid ProductCategoryId,
    string ProductCategoryName,
    string Name,
    string Description,
    decimal Price,
    string? ImageUrl,
    bool IsAvailable,
    bool IsFeatured,
    int PreparationTimeMinutes,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

public sealed record StoreSummaryResponse(
    Guid Id,
    int StoreCategoryId,
    string StoreCategoryName,
    string StoreCategorySlug,
    string Name,
    string Slug,
    string Description,
    string? LogoUrl,
    string? CoverImageUrl,
    decimal DeliveryFee,
    decimal MinimumOrderAmount,
    int EstimatedDeliveryMinutesMin,
    int EstimatedDeliveryMinutesMax,
    decimal RatingAverage,
    int RatingCount,
    bool IsOpen
);

public sealed record StoreDetailResponse(
    Guid Id,
    int StoreCategoryId,
    string StoreCategoryName,
    string StoreCategorySlug,
    string Name,
    string Slug,
    string Description,
    string PhoneNumber,
    string? Email,
    string? LogoUrl,
    string? CoverImageUrl,
    string Street,
    string ExteriorNumber,
    string? InteriorNumber,
    string Neighborhood,
    string City,
    string State,
    string PostalCode,
    decimal? Latitude,
    decimal? Longitude,
    decimal DeliveryFee,
    decimal MinimumOrderAmount,
    int EstimatedDeliveryMinutesMin,
    int EstimatedDeliveryMinutesMax,
    decimal RatingAverage,
    int RatingCount,
    bool IsOpen,
    bool IsActive,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    IReadOnlyCollection<ProductCategoryResponse> ProductCategories
);
