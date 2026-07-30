using Backend.Contracts.Addresses;
using Backend.Data;
using Backend.Middleware.Exceptions;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services.Addresses;

public sealed class AddressService(
    AppDbContext database,
    TimeProvider timeProvider
) : IAddressService
{
    public async Task<IReadOnlyCollection<AddressResponse>> GetAllAsync(
        Guid userId,
        CancellationToken cancellationToken
    )
    {
        var addresses = await database.Addresses
            .AsNoTracking()
            .Where(address => address.UserId == userId)
            .OrderByDescending(address => address.IsDefault)
            .ThenBy(address => address.CreatedAt)
            .ToListAsync(cancellationToken);

        return addresses.Select(ToResponse).ToArray();
    }

    public async Task<AddressResponse> GetByIdAsync(
        Guid userId,
        Guid addressId,
        CancellationToken cancellationToken
    )
    {
        var address = await FindOwnedAddressAsync(
            userId,
            addressId,
            asTracking: false,
            cancellationToken
        );

        return ToResponse(address);
    }

    public async Task<AddressResponse> CreateAsync(
        Guid userId,
        SaveAddressRequest request,
        CancellationToken cancellationToken
    )
    {
        var existingAddresses = await database.Addresses
            .Where(address => address.UserId == userId)
            .ToListAsync(cancellationToken);

        var address = new Address
        {
            UserId = userId,
            CreatedAt = timeProvider.GetUtcNow().UtcDateTime
        };

        Apply(request, address);
        address.IsDefault = request.IsDefault || existingAddresses.Count == 0;

        if (address.IsDefault)
        {
            foreach (var existingAddress in existingAddresses)
            {
                existingAddress.IsDefault = false;
            }
        }

        database.Addresses.Add(address);
        await database.SaveChangesAsync(cancellationToken);
        return ToResponse(address);
    }

    public async Task<AddressResponse> UpdateAsync(
        Guid userId,
        Guid addressId,
        SaveAddressRequest request,
        CancellationToken cancellationToken
    )
    {
        var address = await FindOwnedAddressAsync(
            userId,
            addressId,
            asTracking: true,
            cancellationToken
        );

        Apply(request, address);

        if (request.IsDefault && !address.IsDefault)
        {
            await ClearOtherDefaultsAsync(
                userId,
                addressId,
                cancellationToken
            );
            address.IsDefault = true;
        }

        await database.SaveChangesAsync(cancellationToken);
        return ToResponse(address);
    }

    public async Task DeleteAsync(
        Guid userId,
        Guid addressId,
        CancellationToken cancellationToken
    )
    {
        var address = await FindOwnedAddressAsync(
            userId,
            addressId,
            asTracking: true,
            cancellationToken
        );

        var wasDefault = address.IsDefault;
        database.Addresses.Remove(address);

        if (wasDefault)
        {
            var replacement = await database.Addresses
                .Where(candidate =>
                    candidate.UserId == userId
                    && candidate.Id != addressId
                )
                .OrderBy(candidate => candidate.CreatedAt)
                .FirstOrDefaultAsync(cancellationToken);

            if (replacement is not null)
            {
                replacement.IsDefault = true;
            }
        }

        await database.SaveChangesAsync(cancellationToken);
    }

    public async Task<AddressResponse> SetDefaultAsync(
        Guid userId,
        Guid addressId,
        CancellationToken cancellationToken
    )
    {
        var address = await FindOwnedAddressAsync(
            userId,
            addressId,
            asTracking: true,
            cancellationToken
        );

        await ClearOtherDefaultsAsync(userId, addressId, cancellationToken);
        address.IsDefault = true;
        await database.SaveChangesAsync(cancellationToken);
        return ToResponse(address);
    }

    private async Task<Address> FindOwnedAddressAsync(
        Guid userId,
        Guid addressId,
        bool asTracking,
        CancellationToken cancellationToken
    )
    {
        IQueryable<Address> query = database.Addresses;

        if (!asTracking)
        {
            query = query.AsNoTracking();
        }

        return await query.SingleOrDefaultAsync(
            address =>
                address.Id == addressId
                && address.UserId == userId,
            cancellationToken
        ) ?? throw new NotFoundApiException(
            "No se encontró la dirección solicitada."
        );
    }

    private async Task ClearOtherDefaultsAsync(
        Guid userId,
        Guid addressId,
        CancellationToken cancellationToken
    )
    {
        var defaultAddresses = await database.Addresses
            .Where(address =>
                address.UserId == userId
                && address.Id != addressId
                && address.IsDefault
            )
            .ToListAsync(cancellationToken);

        foreach (var defaultAddress in defaultAddresses)
        {
            defaultAddress.IsDefault = false;
        }
    }

    private static void Apply(
        SaveAddressRequest request,
        Address address
    )
    {
        address.Label = request.Label.Trim();
        address.Street = request.Street.Trim();
        address.ExteriorNumber = request.ExteriorNumber.Trim();
        address.InteriorNumber = NormalizeOptional(request.InteriorNumber);
        address.Neighborhood = request.Neighborhood.Trim();
        address.City = request.City.Trim();
        address.State = request.State.Trim();
        address.PostalCode = request.PostalCode.Trim();
        address.Country = request.Country.Trim();
        address.References = NormalizeOptional(request.References);
        address.Latitude = request.Latitude;
        address.Longitude = request.Longitude;
    }

    private static AddressResponse ToResponse(Address address) =>
        new(
            address.Id,
            address.Label,
            address.Street,
            address.ExteriorNumber,
            address.InteriorNumber,
            address.Neighborhood,
            address.City,
            address.State,
            address.PostalCode,
            address.Country,
            address.References,
            address.Latitude,
            address.Longitude,
            address.IsDefault,
            address.CreatedAt
        );

    private static string? NormalizeOptional(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
