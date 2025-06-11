using Microsoft.AspNetCore.Mvc;
using TinyHouse.Api.Models;

namespace YourNamespace.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LoginController : ControllerBase
    {
        [HttpPost]
        public IActionResult Login([FromBody] LoginRequest request)
        {
            // Sadece admin girişine izin ver
            if (request.Email == "admin@gmail.com" && request.Password == "123456")
            {
                return Ok(new {
                    token = "admin-fake-jwt-token",
                    user = new {
                        id = 1,
                        email = request.Email,
                        role = request.Role ?? "admin"
                    }
                });
            }
            // Diğer tüm girişler reddedilsin
            return Unauthorized(new { message = "Geçersiz e-posta veya şifre" });
        }
    }
}