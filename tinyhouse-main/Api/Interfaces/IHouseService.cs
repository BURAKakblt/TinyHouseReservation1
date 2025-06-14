using TinyHouse.Api.Dtos;

namespace TinyHouse.Api.Interfaces
{
    public interface IHouseService
    {
        Task<IEnumerable<HouseDto>> GetPopularHousesAsync();
        Task<IEnumerable<HouseDto>> FilterHousesAsync(string? location, decimal? minPrice, decimal? maxPrice, int? bedrooms);
    }
} 