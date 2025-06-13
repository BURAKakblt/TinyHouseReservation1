using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using TinyHouse.Api.Data;
using System.Data;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/reservations")]
    public class ReservationsController : ControllerBase
    {
        private readonly DatabaseHelper _db;
        public ReservationsController(DatabaseHelper db)
        {
            _db = db;
        }

        [HttpGet("by-{email}")]
        public async Task<IActionResult> GetReservationsByEmail(string email)
        {
            var userIdQuery = "SELECT TOP 1 UserID FROM Users WHERE Email = @Email";
            var userIdObj = await _db.ExecuteScalarAsync(userIdQuery, new Dictionary<string, object> { { "@Email", email } });
            if (userIdObj == null)
                return Ok(new List<object>()); // Kullanıcı yoksa boş liste
            int userId = Convert.ToInt32(userIdObj);

            var query = @"SELECT r.ReservationID, r.HouseID, r.StartDate, r.EndDate, r.Status, r.TotalPrice, r.Guests, h.Title AS HouseTitle, h.Location
                          FROM Reservations r
                          JOIN Houses h ON r.HouseID = h.HouseID
                          WHERE r.TenantID = @TenantID
                          ORDER BY r.StartDate DESC";
            var parameters = new Dictionary<string, object> { { "@TenantID", userId } };
            var table = await _db.ExecuteQueryAsync(query, parameters);
            var reservations = new List<object>();
            foreach (DataRow row in table.Rows)
            {
                reservations.Add(new
                {
                    id = row["ReservationID"],
                    house = new {
                        id = row["HouseID"],
                        title = row["HouseTitle"],
                        location = row["Location"]
                    },
                    checkIn = row["StartDate"],
                    checkOut = row["EndDate"],
                    guests = row["Guests"],
                    totalPrice = row["TotalPrice"],
                    status = row["Status"],
                    review = (object)null // Geliştirilebilir
                });
            }
            return Ok(reservations);
        }

        [HttpPost]
        public async Task<IActionResult> CreateReservation([FromBody] ReservationCreateDto dto)
        {
            // HouseID kontrolü
            var houseQuery = "SELECT COUNT(1) FROM Houses WHERE HouseID = @HouseID";
            var houseCount = await _db.ExecuteScalarAsync(houseQuery, new Dictionary<string, object> { { "@HouseID", dto.HouseID } });
            if (Convert.ToInt32(houseCount) == 0)
                return BadRequest(new { message = "Geçersiz ev ID'si." });

            // Kullanıcı ID'sini bul
            var userIdQuery = "SELECT TOP 1 UserID FROM Users WHERE Email = @Email";
            var userIdObj = await _db.ExecuteScalarAsync(userIdQuery, new Dictionary<string, object> { { "@Email", dto.Email } });
            if (userIdObj == null)
                return BadRequest(new { message = "Kullanıcı bulunamadı." });
            int userId = Convert.ToInt32(userIdObj);

            // Rezervasyon ekle ve yeni ReservationID'yi al
            var query = @"INSERT INTO Reservations (HouseID, TenantID, StartDate, EndDate, Status, CreatedAt, TotalPrice, Guests)
                          VALUES (@HouseID, @TenantID, @StartDate, @EndDate, @Status, GETDATE(), @TotalPrice, @Guests);
                          SELECT SCOPE_IDENTITY();";
            var parameters = new Dictionary<string, object>
            {
                {"@HouseID", dto.HouseID},
                {"@TenantID", userId},
                {"@StartDate", dto.StartDate},
                {"@EndDate", dto.EndDate},
                {"@Status", "Paid"},
                {"@TotalPrice", dto.TotalPrice},
                {"@Guests", dto.Guests}
            };
            var reservationIdObj = await _db.ExecuteScalarAsync(query, parameters);
            int reservationId = Convert.ToInt32(reservationIdObj);

            // Payments tablosuna kayıt ekle
            var insertPaymentQuery = @"INSERT INTO Payments (ReservationID, Amount, PaymentMethod, PaymentDate, Status)
                                      VALUES (@ReservationID, @Amount, @PaymentMethod, @PaymentDate, @Status)";
            var paymentParams = new Dictionary<string, object>
            {
                {"@ReservationID", reservationId},
                {"@Amount", dto.TotalPrice},
                {"@PaymentMethod", "Kredi Kartı"},
                {"@PaymentDate", DateTime.Now},
                {"@Status", "completed"}
            };
            await _db.ExecuteNonQueryAsync(insertPaymentQuery, paymentParams);

            return Ok(new { message = "Rezervasyon ve ödeme kaydedildi." });
        }
    }

    public class ReservationCreateDto
    {
        public int HouseID { get; set; }
        public string Email { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public decimal TotalPrice { get; set; }
        public int Guests { get; set; }
    }
} 