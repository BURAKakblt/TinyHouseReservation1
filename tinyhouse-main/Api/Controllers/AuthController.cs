using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Microsoft.IdentityModel.Tokens;
using TinyHouse.Api.Models;
using Api.Services;
using BCrypt.Net;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly ILogger<AuthController> _logger;
        private readonly IConfiguration _configuration;

        public AuthController(IUserService userService, ILogger<AuthController> logger, IConfiguration configuration)
        {
            _userService = userService;
            _logger = logger;
            _configuration = configuration;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            try
            {
                _logger.LogInformation("Login attempt for email: {Email}, role: {Role}", request.Email, request.Role);

                if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Password))
                {
                    _logger.LogWarning("Login failed: Email or password is empty");
                    return BadRequest(new { message = "Email ve şifre gereklidir." });
                }

                var user = await _userService.GetUserByEmail(request.Email);
                if (user == null)
                {
                    _logger.LogWarning("Login failed: User not found for email: {Email}", request.Email);
                    return BadRequest(new { message = "Kullanıcı bulunamadı." });
                }

                if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
                {
                    _logger.LogWarning("Login failed: Invalid password for email: {Email}", request.Email);
                    return BadRequest(new { message = "Geçersiz şifre." });
                }

                if (user.Role != request.Role)
                {
                    _logger.LogWarning("Login failed: Invalid role for email: {Email}. Expected: {ExpectedRole}, Got: {ActualRole}", 
                        request.Email, request.Role, user.Role);
                    return BadRequest(new { message = "Geçersiz kullanıcı rolü." });
                }

                var token = GenerateJwtToken(user);
                _logger.LogInformation("Login successful for email: {Email}", request.Email);

                return Ok(new
                {
                    token,
                    user = new
                    {
                        id = user.UserID,
                        email = user.Email,
                        role = user.Role,
                        firstName = user.FirstName,
                        lastName = user.LastName
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during login for email: {Email}", request.Email);
                return StatusCode(500, new { message = "Sunucu hatası oluştu." });
            }
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] SignupRequest request)
        {
            if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Password) || string.IsNullOrEmpty(request.Username))
            {
                return BadRequest(new { message = "Tüm alanlar zorunludur." });
            }

            // Aynı e-posta ile aynı rol için kayıt var mı?
            var existingUser = await _userService.GetUserByEmail(request.Email);
            if (existingUser != null)
            {
                return BadRequest(new { message = "Bu e-posta ile zaten bir kullanıcı mevcut." });
            }

            // Şifreyi hashle
            var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
            var user = new User
            {
                Email = request.Email,
                PasswordHash = passwordHash,
                FirstName = request.Username,
                LastName = "",
                Role = request.RoleID == 2 ? "owner" : request.RoleID == 3 ? "tenant" : "user"
            };
            await _userService.CreateUser(user);
            return Ok(new { message = "Kayıt başarılı!" });
        }

        private string GenerateJwtToken(User user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Key"] ?? "your-256-bit-secret");
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.UserID.ToString()),
                    new Claim(ClaimTypes.Email, user.Email),
                    new Claim(ClaimTypes.Role, user.Role)
                }),
                Expires = DateTime.UtcNow.AddDays(7),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }
} 