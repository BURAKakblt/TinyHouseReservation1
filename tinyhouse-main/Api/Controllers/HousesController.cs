using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Linq;

namespace YourNamespace.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HousesController : ControllerBase
    {
        private static List<House> _houses = new List<House>
        {
            new House
            {
                HouseID = 1,
                Title = "Modern Tiny House",
                Description = "Doğayla iç içe modern bir yaşam deneyimi sunan tiny house. Şehir hayatından uzak, huzurlu bir tatil için ideal.",
                PricePerNight = 500,
                HouseType = "Tiny House",
                City = "İstanbul",
                Country = "Türkiye",
                MaxGuests = 2,
                Bedrooms = 1,
                Rating = 4.5,
                CoverImageUrl = "/images/house1.jpg",
                Images = new List<string> 
                { 
                    "/images/house1.jpg",
                    "/images/house1-interior1.jpg",
                    "/images/house1-interior2.jpg",
                    "/images/house1-exterior.jpg"
                },
                Features = new List<string> 
                { 
                    "WiFi", 
                    "Klima", 
                    "Mutfak", 
                    "TV", 
                    "Park Yeri",
                    "Bahçe",
                    "Barbekü",
                    "Jakuzi"
                },
                OwnerID = 1,
                IsAvailable = true
            },
            new House
            {
                HouseID = 2,
                Title = "Ahşap Tiny House",
                Description = "Geleneksel ahşap mimarisi ile modern konforu bir araya getiren tiny house. Doğal malzemeler ve şık tasarım.",
                PricePerNight = 450,
                HouseType = "Tiny House",
                City = "İzmir",
                Country = "Türkiye",
                MaxGuests = 3,
                Bedrooms = 1,
                Rating = 4.8,
                CoverImageUrl = "/images/house2.jpg",
                Images = new List<string> 
                { 
                    "/images/house2.jpg",
                    "/images/house2-interior1.jpg",
                    "/images/house2-interior2.jpg",
                    "/images/house2-exterior.jpg"
                },
                Features = new List<string> 
                { 
                    "WiFi", 
                    "Klima", 
                    "Mutfak", 
                    "TV", 
                    "Park Yeri", 
                    "Bahçe",
                    "Şömine",
                    "Çamaşır Makinesi"
                },
                OwnerID = 2,
                IsAvailable = true
            }
        };

        [HttpGet]
        public IActionResult GetAllHouses([FromQuery] bool? available = true)
        {
            try
            {
                var houses = _houses;
                if (available.HasValue)
                {
                    houses = houses.Where(h => h.IsAvailable == available.Value).ToList();
                }
                return Ok(houses);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Evler listelenirken bir hata oluştu", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public IActionResult GetHouseById(int id)
        {
            try
            {
                var house = _houses.FirstOrDefault(h => h.HouseID == id);
                if (house == null)
                {
                    return NotFound(new { message = "Ev bulunamadı" });
                }

                return Ok(house);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Ev detayları alınırken bir hata oluştu", error = ex.Message });
            }
        }

        [HttpGet("by-owner/{ownerId}")]
        public IActionResult GetHousesByOwner(int ownerId)
        {
            try
            {
                var houses = _houses.Where(h => h.OwnerID == ownerId).ToList();
                return Ok(houses);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Ev sahibinin evleri listelenirken bir hata oluştu", error = ex.Message });
            }
        }
    }

    public class House
    {
        public int HouseID { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public decimal PricePerNight { get; set; }
        public string HouseType { get; set; }
        public string City { get; set; }
        public string Country { get; set; }
        public int MaxGuests { get; set; }
        public int Bedrooms { get; set; }
        public double Rating { get; set; }
        public string CoverImageUrl { get; set; }
        public List<string> Images { get; set; }
        public List<string> Features { get; set; }
        public int OwnerID { get; set; }
        public bool IsAvailable { get; set; }
    }
} 