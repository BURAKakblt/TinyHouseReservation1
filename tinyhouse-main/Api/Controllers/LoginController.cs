using Microsoft.AspNetCore.Mvc;

namespace YourNamespace.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LoginController : ControllerBase
    {
        [HttpPost]
        public IActionResult Login([FromBody] LoginRequest request)
        {
            // Basit bir kontrol (ileride veritabanı ile kontrol edeceğiz)
            if (request.Email == "test@example.com" && request.Password == "123456")
            {
                return Ok(new { message = "Giriş başarılı" });
            }

            return Unauthorized(new { message = "Geçersiz e-posta veya şifre" });
        }
    }

    public class LoginRequest
    {
        public string Email { get; set; }
        public string Password { get; set; }
    }
}