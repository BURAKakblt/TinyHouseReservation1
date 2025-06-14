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
            var body = $@"<!DOCTYPE html>
<html lang='tr'>
  <head>
    <meta charset='UTF-8' />
    <title>Rezervasyon Onayı</title>
    <style>
      body {{ font-family: 'Segoe UI', Arial, sans-serif; background: #f6f8fa; margin: 0; padding: 0; }}
      .container {{ max-width: 480px; margin: 32px auto; background: #fff; border-radius: 16px; box-shadow: 0 2px 12px #0001; padding: 32px 24px; }}
      .header {{ text-align: center; }}
      .header img {{ width: 64px; margin-bottom: 12px; }}
      .title {{ color: #2d3748; font-size: 1.5rem; font-weight: bold; margin-bottom: 8px; }}
      .subtitle {{ color: #4a5568; font-size: 1.1rem; margin-bottom: 24px; }}
      .info {{ background: #f1f5f9; border-radius: 8px; padding: 16px; margin-bottom: 24px; }}
      .info-row {{ margin-bottom: 8px; }}
      .info-label {{ color: #64748b; font-weight: 500; }}
      .info-value {{ color: #2d3748; font-weight: 600; }}
      .footer {{ text-align: center; color: #64748b; font-size: 0.95rem; margin-top: 24px; }}
      .button {{ display: inline-block; background: #4f46e5; color: #fff; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 16px; }}
    </style>
  </head>
  <body>
    <div class='container'>
      <div class='header'>
        <img src='https://cdn-icons-png.flaticon.com/512/190/190411.png' alt='Tiny House' />
        <div class='title'>Rezervasyonunuz Onaylandı!</div>
        <div class='subtitle'>MyTinyHouse ailesine hoş geldiniz 🎉</div>
      </div>
      <div class='info'>
        <div class='info-row'><span class='info-label'>Ev:</span> <span class='info-value'>{dto.houseTitle}</span></div>
        <div class='info-row'><span class='info-label'>Tarih:</span> <span class='info-value'>{dto.startDate} - {dto.endDate}</span></div>
        <div class='info-row'><span class='info-label'>Kişi:</span> <span class='info-value'>{dto.guests}</span></div>
        <div class='info-row'><span class='info-label'>Toplam Fiyat:</span> <span class='info-value'>{dto.totalPrice} TL</span></div>
      </div>
      <div style='text-align:center;'>
        <a href='https://your-tinyhouse-site.com/tenant2/reservations' class='button'>Rezervasyonlarımı Görüntüle</a>
      </div>
      <div class='footer'>
        <p>Herhangi bir sorunuz olursa bu e-postaya yanıt verebilirsiniz.<br>
        Keyifli bir konaklama dileriz!<br>
        <b>MyTinyHouse Ekibi</b></p>
      </div>
    </div>
  </body>
</html>";

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
                    // Kiracıya mail (HTML)
                    var mailMessage = new MailMessage(from, dto.tenantEmail, subject, body);
                    mailMessage.IsBodyHtml = true;
                    client.Send(mailMessage);
                    // Ev sahibine mail (düz metin)
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