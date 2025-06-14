using Microsoft.AspNetCore.Http;
using System.Collections.Generic;

namespace TinyHouse.Api.Dtos
{
    public class HouseDto
    {
        public int HouseID { get; set; }
        public string Title { get; set; } = "";
        public string Description { get; set; } = "";
        public decimal PricePerNight { get; set; }
        public string Location { get; set; } = "";
        public string CoverImageUrl { get; set; } = "";
        public double Rating { get; set; }
        public int ReviewCount { get; set; }
        public int OwnerID { get; set; }
        public string OwnerEmail { get; set; }
        public string City { get; set; }
        public string Country { get; set; }
        public int Bedrooms { get; set; }
        public int Bathrooms { get; set; }
        public string HouseType { get; set; }
        public int MaxGuests { get; set; }
        public string? Features { get; set; } = "";
        public IFormFile CoverImage { get; set; }
        public List<IFormFile> InteriorImages { get; set; }
    }
} 