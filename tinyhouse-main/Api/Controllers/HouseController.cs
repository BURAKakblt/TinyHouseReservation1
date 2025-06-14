using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;
using TinyHouse.Api.Interfaces;
using TinyHouse.Api.Dtos;

namespace TinyHouse.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HouseController : ControllerBase
    {
        private readonly IHouseService _houseService;

        public HouseController(IHouseService houseService)
        {
            _houseService = houseService;
        }

        [HttpGet("popular")]
        public async Task<IActionResult> GetPopularHouses()
        {
            try
            {
                var popularHouses = await _houseService.GetPopularHousesAsync();
                return Ok(popularHouses);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Popüler evler getirilirken bir hata oluştu.", error = ex.Message });
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetHouses(
            [FromQuery] string location = "",
            [FromQuery] decimal? priceMin = null,
            [FromQuery] decimal? priceMax = null,
            [FromQuery] int? bedrooms = null)
        {
            try
            {
                var houses = await _houseService.FilterHousesAsync(location, priceMin, priceMax, bedrooms);
                return Ok(houses);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Evler getirilirken bir hata oluştu.", error = ex.Message });
            }
        }
    }
} 