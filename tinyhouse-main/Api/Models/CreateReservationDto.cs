// Models/CreateReservationDto.cs
namespace TinyHouse.Api.Models;

public record CreateReservationDto(
    int HouseID,
    int TenantID,
    DateTime StartDate,
    DateTime EndDate
);


