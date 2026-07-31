using Backend.Contracts.Drivers;

namespace Backend.Services.Drivers;

public interface IDriverService
{
    Task<DriverProfileResponse> GetProfileAsync(
        Guid userId,
        CancellationToken cancellationToken
    );

    Task<DriverProfileResponse> RegisterAsync(
        Guid userId,
        SaveDriverProfileRequest request,
        CancellationToken cancellationToken
    );

    Task<DriverProfileResponse> UpdateAsync(
        Guid userId,
        SaveDriverProfileRequest request,
        CancellationToken cancellationToken
    );

    Task<DriverProfileResponse> SetAvailabilityAsync(
        Guid userId,
        DriverAvailabilityRequest request,
        CancellationToken cancellationToken
    );

    Task<DriverProfileResponse> UpdateLocationAsync(
        Guid userId,
        DriverLocationRequest request,
        CancellationToken cancellationToken
    );

    Task<DriverSummaryResponse> GetSummaryAsync(
        Guid userId,
        CancellationToken cancellationToken
    );
}
