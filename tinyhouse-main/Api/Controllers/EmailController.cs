using Microsoft.AspNetCore.Mvc;
using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Configuration;
using System.Text.Json;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/send-reservation-mail")]
    public class EmailController : ControllerBase
    {
        private readonly IConfiguration _config;
        public EmailController(IConfiguration config)
        {
            _config = config;
        }

        [HttpPost]
        public IActionResult SendReservationMail([FromBody] ReservationMailDto dto)
        {
            Console.WriteLine("Mail endpointi tetiklendi. DTO: " + JsonSerializer.Serialize(dto));
            var smtpHost = _config["Smtp:Host"];
            var smtpPort = int.Parse(_config["Smtp:Port"] ?? "587");
            var smtpUser = _config["Smtp:User"];
            var smtpPass = _config["Smtp:Pass"];
            var from = _config["Smtp:From"] ?? smtpUser;

            var subject = $"Rezervasyon Onayı: {dto.houseTitle}";
            var body = $@"Merhaba,

Rezervasyonunuz başarıyla oluşturuldu!

Ev: {dto.houseTitle}
Tarih: {dto.startDate} - {dto.endDate}
Kişi: {dto.guests}
Toplam Fiyat: {dto.totalPrice} TL

İyi günler dileriz.";

            var ownerBody = $@"Merhaba,

Ev sahibi olarak eviniz için yeni bir rezervasyon yapıldı!

Ev: {dto.houseTitle}
Tarih: {dto.startDate} - {dto.endDate}
Kişi: {dto.guests}
Toplam Fiyat: {dto.totalPrice} TL

Kiracı: {dto.tenantEmail}
";

            try
            {
                Console.WriteLine("Mail gönderme işlemi başlıyor...");
                using (var client = new SmtpClient(smtpHost, smtpPort))
                {
                    client.EnableSsl = true;
                    client.Credentials = new NetworkCredential(smtpUser, smtpPass);
                    // Kiracıya mail
                    client.Send(new MailMessage(from, dto.tenantEmail, subject, body));
                    // Ev sahibine mail
                    client.Send(new MailMessage(from, dto.ownerEmail, subject, ownerBody));
                }
                Console.WriteLine("E-posta başarıyla gönderildi: " + dto.tenantEmail + ", " + dto.ownerEmail);
                return Ok(new { message = "E-posta gönderildi" });
            }
            catch (System.Exception ex)
            {
                Console.WriteLine($"E-posta gönderilemedi: {ex.Message}\n{ex.StackTrace}");
                return StatusCode(500, new { message = "E-posta gönderilemedi. Lütfen SMTP ayarlarını ve uygulama şifresini kontrol edin.", error = ex.Message });
            }
        }
    }

    public class ReservationMailDto
    {
        public string tenantEmail { get; set; }
        public string ownerEmail { get; set; }
        public string houseTitle { get; set; }
        public string startDate { get; set; }
        public string endDate { get; set; }
        public int guests { get; set; }
        public decimal totalPrice { get; set; }
    }
} 