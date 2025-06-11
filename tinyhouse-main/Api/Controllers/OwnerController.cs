using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/owner2")]
    public class OwnerController : ControllerBase
    {
        [HttpGet("dashboard")]
        public IActionResult GetDashboard()
        {
            // Örnek veri
            return Ok(new { message = "Owner dashboard çalışıyor!" });
        }
    }
} 