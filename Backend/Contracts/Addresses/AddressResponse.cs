namespace Backend.Contracts.Addresses;

public sealed record AddressResponse(
    Guid Id,
    string Label,
    string Street,
    string ExteriorNumber,
    string? InteriorNumber,
    string Neighborhood,
    string City,
    string State,
    string PostalCode,
    string Country,
    string? References,
    decimal? Latitude,
    decimal? Longitude,
    bool IsDefault,
    DateTime CreatedAt
);
