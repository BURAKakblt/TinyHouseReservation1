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
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Mail;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly ILogger<AuthController> _logger;
        private readonly IConfiguration _configuration;
        private static List<PasswordResetCode> resetCodes = new List<PasswordResetCode>();

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
                LastName = request.LastName ?? "",
                Role = !string.IsNullOrEmpty(request.Role) ? request.Role : (request.RoleID == 2 ? "owner" : request.RoleID == 3 ? "tenant" : "user"),
                Username = request.Username
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

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
        {
            var user = await _userService.GetUserByEmail(request.Email);
            if (user == null)
                return BadRequest(new { message = "Kullanıcı bulunamadı." });

            var code = new Random().Next(100000, 999999).ToString();
            resetCodes.RemoveAll(x => x.Email == request.Email);
            resetCodes.Add(new PasswordResetCode
            {
                Email = request.Email,
                Code = code,
                Expiry = DateTime.UtcNow.AddMinutes(10)
            });

            // SMTP ayarlarını al
            var smtpHost = _configuration["Smtp:Host"];
            var smtpPort = int.Parse(_configuration["Smtp:Port"] ?? "587");
            var smtpUser = _configuration["Smtp:User"];
            var smtpPass = _configuration["Smtp:Pass"];
            var from = _configuration["Smtp:From"] ?? smtpUser;

            var subject = "Şifre Sıfırlama Kodu";
            var body = $"Şifre sıfırlama kodunuz: {code}";

            try
            {
                using (var client = new SmtpClient(smtpHost, smtpPort))
                {
                    client.EnableSsl = true;
                    client.Credentials = new NetworkCredential(smtpUser, smtpPass);
                    client.Send(new MailMessage(from, request.Email, subject, body));
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "E-posta gönderilemedi. Lütfen SMTP ayarlarını ve uygulama şifresini kontrol edin.", error = ex.Message });
            }

            return Ok(new { message = "Kod gönderildi." });
        }

        public class ForgotPasswordRequest
        {
            public string Email { get; set; }
        }

        [HttpPost("verify-reset-code")]
        public IActionResult VerifyResetCode([FromBody] VerifyCodeRequest request)
        {
            var codeEntry = resetCodes.FirstOrDefault(x => x.Email == request.Email && x.Code == request.Code);
            if (codeEntry == null || codeEntry.Expiry < DateTime.UtcNow)
                return BadRequest(new { message = "Kod geçersiz veya süresi dolmuş." });

            return Ok(new { message = "Kod doğru." });
        }

        public class VerifyCodeRequest
        {
            public string Email { get; set; }
            public string Code { get; set; }
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            var codeEntry = resetCodes.FirstOrDefault(x => x.Email == request.Email && x.Code == request.Code);
            if (codeEntry == null || codeEntry.Expiry < DateTime.UtcNow)
                return BadRequest(new { message = "Kod geçersiz veya süresi dolmuş." });

            var user = await _userService.GetUserByEmail(request.Email);
            if (user == null)
                return BadRequest(new { message = "Kullanıcı bulunamadı." });

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            await _userService.UpdateUser(user);
            resetCodes.RemoveAll(x => x.Email == request.Email);

            return Ok(new { message = "Şifre başarıyla değiştirildi." });
        }

        public class ResetPasswordRequest
        {
            public string Email { get; set; }
            public string Code { get; set; }
            public string NewPassword { get; set; }
        }
    }
} 