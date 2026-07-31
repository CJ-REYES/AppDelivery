using Backend.Authorization;
using Backend.Contracts.Catalog;
using Backend.Services.Catalog;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Authorize]
[Route("api/merchant")]
public sealed class MerchantCatalogController(
    ICurrentUserService currentUser,
    IMerchantCatalogService merchantCatalogService
) : ControllerBase
{
    [HttpPost("store")]
    public async Task<IActionResult> CreateStore(
        SaveStoreRequest request,
        CancellationToken cancellationToken
    )
    {
        var response = await merchantCatalogService.CreateStoreAsync(
            currentUser.UserId,
            request,
            cancellationToken
        );

        return Created("/api/merchant/store", response);
    }

    [HttpGet("store")]
    [Authorize(Policy = "MerchantOnly")]
    public async Task<IActionResult> GetStore(
        CancellationToken cancellationToken
    )
    {
        var response = await merchantCatalogService.GetStoreAsync(
            currentUser.UserId,
            cancellationToken
        );

        return Ok(response);
    }

    [HttpPut("store")]
    [Authorize(Policy = "MerchantOnly")]
    public async Task<IActionResult> UpdateStore(
        SaveStoreRequest request,
        CancellationToken cancellationToken
    )
    {
        var response = await merchantCatalogService.UpdateStoreAsync(
            currentUser.UserId,
            request,
            cancellationToken
        );

        return Ok(response);
    }

    [HttpDelete("store")]
    [Authorize(Policy = "MerchantOnly")]
    public async Task<IActionResult> DeactivateStore(
        CancellationToken cancellationToken
    )
    {
        await merchantCatalogService.DeactivateStoreAsync(
            currentUser.UserId,
            cancellationToken
        );

        return NoContent();
    }

    [HttpGet("categories")]
    [Authorize(Policy = "MerchantOnly")]
    public async Task<IActionResult> GetCategories(
        CancellationToken cancellationToken
    )
    {
        var response = await merchantCatalogService.GetCategoriesAsync(
            currentUser.UserId,
            cancellationToken
        );

        return Ok(response);
    }

    [HttpPost("categories")]
    [Authorize(Policy = "MerchantOnly")]
    public async Task<IActionResult> CreateCategory(
        SaveProductCategoryRequest request,
        CancellationToken cancellationToken
    )
    {
        var response = await merchantCatalogService.CreateCategoryAsync(
            currentUser.UserId,
            request,
            cancellationToken
        );

        return Created($"/api/merchant/categories/{response.Id}", response);
    }

    [HttpPut("categories/{categoryId:guid}")]
    [Authorize(Policy = "MerchantOnly")]
    public async Task<IActionResult> UpdateCategory(
        Guid categoryId,
        SaveProductCategoryRequest request,
        CancellationToken cancellationToken
    )
    {
        var response = await merchantCatalogService.UpdateCategoryAsync(
            currentUser.UserId,
            categoryId,
            request,
            cancellationToken
        );

        return Ok(response);
    }

    [HttpDelete("categories/{categoryId:guid}")]
    [Authorize(Policy = "MerchantOnly")]
    public async Task<IActionResult> DeleteCategory(
        Guid categoryId,
        CancellationToken cancellationToken
    )
    {
        await merchantCatalogService.DeleteCategoryAsync(
            currentUser.UserId,
            categoryId,
            cancellationToken
        );

        return NoContent();
    }

    [HttpGet("products")]
    [Authorize(Policy = "MerchantOnly")]
    public async Task<IActionResult> GetProducts(
        CancellationToken cancellationToken
    )
    {
        var response = await merchantCatalogService.GetProductsAsync(
            currentUser.UserId,
            cancellationToken
        );

        return Ok(response);
    }

    [HttpPost("products")]
    [Authorize(Policy = "MerchantOnly")]
    public async Task<IActionResult> CreateProduct(
        SaveProductRequest request,
        CancellationToken cancellationToken
    )
    {
        var response = await merchantCatalogService.CreateProductAsync(
            currentUser.UserId,
            request,
            cancellationToken
        );

        return Created($"/api/merchant/products/{response.Id}", response);
    }

    [HttpPut("products/{productId:guid}")]
    [Authorize(Policy = "MerchantOnly")]
    public async Task<IActionResult> UpdateProduct(
        Guid productId,
        SaveProductRequest request,
        CancellationToken cancellationToken
    )
    {
        var response = await merchantCatalogService.UpdateProductAsync(
            currentUser.UserId,
            productId,
            request,
            cancellationToken
        );

        return Ok(response);
    }

    [HttpDelete("products/{productId:guid}")]
    [Authorize(Policy = "MerchantOnly")]
    public async Task<IActionResult> DeleteProduct(
        Guid productId,
        CancellationToken cancellationToken
    )
    {
        await merchantCatalogService.DeleteProductAsync(
            currentUser.UserId,
            productId,
            cancellationToken
        );

        return NoContent();
    }
}
