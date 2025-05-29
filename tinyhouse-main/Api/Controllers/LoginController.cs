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
            // Sadece email ve password kontrolü, ekstra güvenlik yok
            if (request.Email == "test@example.com" && request.Password == "123456")
            {
                return Ok(new {
                    token = "fake-jwt-token",
                    user = new {
                        id = 1,
                        email = request.Email,
                        role = request.Role ?? "tenant"
                    }
                });
            }
            // Kayıtlı başka kullanıcılar için de giriş izni ver
            if (request.Email == "user2@example.com" && request.Password == "123456")
            {
                return Ok(new {
                    token = "fake-jwt-token-2",
                    user = new {
                        id = 2,
                        email = request.Email,
                        role = request.Role ?? "owner"
                    }
                });
            }
            // Ekstra güvenlik yok, sadece email ve şifre eşleşmesi yeterli
            return Unauthorized(new { message = "Geçersiz e-posta veya şifre" });
        }
    }
}