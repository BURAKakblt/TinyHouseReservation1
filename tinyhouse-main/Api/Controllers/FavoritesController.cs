using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/favorites")]
    public class FavoritesController : ControllerBase
    {
        [HttpGet("{uid}")]
        public IActionResult GetFavorites(int uid)
        {
            // Şimdilik boş dizi döndür
            return Ok(new object[] { });
        }
    }
} 