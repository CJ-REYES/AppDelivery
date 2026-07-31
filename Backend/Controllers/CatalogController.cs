using Backend.Services.Catalog;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[AllowAnonymous]
[Route("api/catalog")]
public sealed class CatalogController(ICatalogService catalogService)
    : ControllerBase
{
    [HttpGet("store-categories")]
    public async Task<IActionResult> GetStoreCategories(
        CancellationToken cancellationToken
    )
    {
        var response = await catalogService.GetStoreCategoriesAsync(
            cancellationToken
        );

        return Ok(response);
    }

    [HttpGet("stores")]
    public async Task<IActionResult> SearchStores(
        [FromQuery] string? search,
        [FromQuery] int? storeCategoryId,
        [FromQuery] bool openOnly = false,
        CancellationToken cancellationToken = default
    )
    {
        var response = await catalogService.SearchStoresAsync(
            search,
            storeCategoryId,
            openOnly,
            cancellationToken
        );

        return Ok(response);
    }

    [HttpGet("stores/{storeId:guid}")]
    public async Task<IActionResult> GetStore(
        Guid storeId,
        CancellationToken cancellationToken
    )
    {
        var response = await catalogService.GetStoreAsync(
            storeId,
            cancellationToken
        );

        return Ok(response);
    }

    [HttpGet("stores/{storeId:guid}/products")]
    public async Task<IActionResult> GetProducts(
        Guid storeId,
        [FromQuery] string? search,
        [FromQuery] Guid? productCategoryId,
        CancellationToken cancellationToken
    )
    {
        var response = await catalogService.GetProductsAsync(
            storeId,
            search,
            productCategoryId,
            cancellationToken
        );

        return Ok(response);
    }
}
