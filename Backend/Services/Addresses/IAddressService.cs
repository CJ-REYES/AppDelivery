using Backend.Contracts.Addresses;

namespace Backend.Services.Addresses;

public interface IAddressService
{
    Task<IReadOnlyCollection<AddressResponse>> GetAllAsync(
        Guid userId,
        CancellationToken cancellationToken
    );

    Task<AddressResponse> GetByIdAsync(
        Guid userId,
        Guid addressId,
        CancellationToken cancellationToken
    );

    Task<AddressResponse> CreateAsync(
        Guid userId,
        SaveAddressRequest request,
        CancellationToken cancellationToken
    );

    Task<AddressResponse> UpdateAsync(
        Guid userId,
        Guid addressId,
        SaveAddressRequest request,
        CancellationToken cancellationToken
    );

    Task DeleteAsync(
        Guid userId,
        Guid addressId,
        CancellationToken cancellationToken
    );

    Task<AddressResponse> SetDefaultAsync(
        Guid userId,
        Guid addressId,
        CancellationToken cancellationToken
    );
}
