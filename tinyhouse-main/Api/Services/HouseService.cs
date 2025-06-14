using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TinyHouse.Api.Data;
using TinyHouse.Api.Dtos;
using TinyHouse.Api.Interfaces;

namespace TinyHouse.Api.Services
{
    public class HouseService : IHouseService
    {
        private readonly HouseContext _context;

        public HouseService(HouseContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<HouseDto>> GetPopularHousesAsync()
        {
            return await _context.Houses
                .OrderByDescending(h => h.Rating)
                .Take(6)
                .Select(h => new HouseDto
                {
                    HouseID = h.HouseID,
                    Title = h.Title,
                    Description = h.Description,
                    PricePerNight = h.PricePerNight,
                    Location = h.Location,
                    CoverImageUrl = h.CoverImageUrl,
                    Rating = h.Rating,
                    ReviewCount = h.TotalReservations
                })
                .ToListAsync();
        }

        public async Task<IEnumerable<HouseDto>> FilterHousesAsync(string? location, decimal? minPrice, decimal? maxPrice, int? bedrooms)
        {
            var query = _context.Houses.AsQueryable();

            if (!string.IsNullOrEmpty(location))
            {
                query = query.Where(h => h.Location.Contains(location));
            }

            if (minPrice.HasValue)
            {
                query = query.Where(h => h.PricePerNight >= minPrice.Value);
            }

            if (maxPrice.HasValue)
            {
                query = query.Where(h => h.PricePerNight <= maxPrice.Value);
            }

            if (bedrooms.HasValue)
            {
                query = query.Where(h => h.Bedrooms >= bedrooms.Value);
            }

            return await query
                .Select(h => new HouseDto
                {
                    HouseID = h.HouseID,
                    Title = h.Title,
                    Description = h.Description,
                    PricePerNight = h.PricePerNight,
                    Location = h.Location,
                    CoverImageUrl = h.CoverImageUrl,
                    Rating = h.Rating,
                    ReviewCount = h.TotalReservations
                })
                .ToListAsync();
        }
    }
} 