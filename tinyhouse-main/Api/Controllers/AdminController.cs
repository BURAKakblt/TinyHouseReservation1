using Microsoft.AspNetCore.Mvc;
using Api.Services;
using TinyHouse.Api.Models;
using System.Threading.Tasks;
using TinyHouse.Api.Data;
using System.Data;
using System.Collections.Generic;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/admin")]
    public class AdminController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly DatabaseHelper _db;
        public AdminController(IUserService userService, DatabaseHelper db)
        {
            _userService = userService;
            _db = db;
        }

        [HttpGet("statistics")]
        public async Task<IActionResult> GetStatistics()
        {
            // Toplam kullanıcı sayısı
            var totalUsers = await _db.ExecuteScalarAsync("SELECT COUNT(*) FROM Users");
            // Aktif kullanıcı sayısı
            var activeUsers = await _db.ExecuteScalarAsync("SELECT COUNT(*) FROM Users WHERE IsActive = 1");
            // Son 30 günde eklenen yeni kullanıcı sayısı
            var newUsers = await _db.ExecuteScalarAsync("SELECT COUNT(*) FROM Users WHERE CreatedAt >= DATEADD(day, -30, GETDATE())");
            // Toplam rezervasyon
            var totalReservations = await _db.ExecuteScalarAsync("SELECT COUNT(*) FROM Reservations");
            // Toplam ödeme
            var totalPayments = await _db.ExecuteScalarAsync("SELECT COUNT(*) FROM Payments");
            // Toplam yorum
            var totalReviews = await _db.ExecuteScalarAsync("SELECT COUNT(*) FROM Reviews");
            // Aylık rezervasyon trendi (son 6 ay)
            var trendQuery = @"SELECT FORMAT(StartDate, 'yyyy-MM') AS Month, COUNT(*) AS Count FROM Reservations WHERE StartDate >= DATEADD(month, -6, GETDATE()) GROUP BY FORMAT(StartDate, 'yyyy-MM') ORDER BY Month";
            var trendTable = await _db.ExecuteQueryAsync(trendQuery);
            var reservationTrends = new List<object>();
            foreach (DataRow row in trendTable.Rows)
            {
                reservationTrends.Add(new { Month = row["Month"], Count = row["Count"] });
            }
            return Ok(new {
                userStats = new {
                    totalUsers,
                    activeUsers,
                    newUsers
                },
                totalReservations,
                totalPayments,
                totalReviews,
                reservationTrends
            });
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _userService.GetAllUsers();
            return Ok(users);
        }

        [HttpGet("listings")]
        public async Task<IActionResult> GetListings()
        {
            var query = "SELECT * FROM Houses";
            var table = await _db.ExecuteQueryAsync(query);
            var listings = new List<object>();
            foreach (DataRow row in table.Rows)
            {
                listings.Add(new
                {
                    id = row["HouseID"],
                    title = row["Title"]?.ToString() ?? "",
                    city = row["City"]?.ToString() ?? "",
                    country = row["Country"]?.ToString() ?? "",
                    createdAt = row.Table.Columns.Contains("CreatedAt") && row["CreatedAt"] != DBNull.Value ? row["CreatedAt"] : null,
                    updatedAt = row.Table.Columns.Contains("UpdatedAt") && row["UpdatedAt"] != DBNull.Value ? row["UpdatedAt"] : null
                });
            }
            return Ok(listings);
        }

        [HttpGet("reservations")]
        public async Task<IActionResult> GetReservations()
        {
            var query = @"SELECT r.ReservationID, r.HouseID, r.TenantID, r.StartDate, r.EndDate, r.Status, r.TotalPrice, r.Guests, r.PaymentStatus, h.Title AS HouseTitle, u.Email AS TenantEmail, u.Name AS TenantName, u.LastName AS TenantLastName
                          FROM Reservations r
                          JOIN Houses h ON r.HouseID = h.HouseID
                          JOIN Users u ON r.TenantID = u.UserID
                          ORDER BY r.ReservationID DESC";
            var table = await _db.ExecuteQueryAsync(query);
            var reservations = new List<object>();
            foreach (DataRow row in table.Rows)
            {
                string paymentStatus = row.Table.Columns.Contains("PaymentStatus") && row["PaymentStatus"] != DBNull.Value ? row["PaymentStatus"].ToString() : null;
                reservations.Add(new
                {
                    id = row["ReservationID"],
                    house = new {
                        id = row["HouseID"],
                        title = row["HouseTitle"]
                    },
                    tenant = row["TenantEmail"],
                    tenantName = row["TenantName"]?.ToString() ?? "",
                    tenantLastName = row["TenantLastName"]?.ToString() ?? "",
                    checkIn = row["StartDate"],
                    checkOut = row["EndDate"],
                    guests = row["Guests"],
                    totalPrice = row["TotalPrice"],
                    status = row["Status"],
                    paymentStatus = paymentStatus == "Paid" ? "Ödeme Yapıldı" : null
                });
            }
            return Ok(reservations);
        }

        [HttpGet("payments")]
        public async Task<IActionResult> GetPayments()
        {
            var query = @"SELECT 
    p.PaymentID,
    p.Amount,
    p.PaymentMethod,
    p.PaymentDate,
    p.Status,
    u.Name AS UserName,
    u.LastName AS UserLastName,
    u.Email AS UserEmail,
    h.Title AS HouseTitle
FROM Payments p
LEFT JOIN Reservations r ON p.ReservationID = r.ReservationID
LEFT JOIN Users u ON r.TenantID = u.UserID
LEFT JOIN Houses h ON r.HouseID = h.HouseID
ORDER BY p.PaymentDate DESC;";
            var table = await _db.ExecuteQueryAsync(query);
            var payments = new List<object>();
            foreach (DataRow row in table.Rows)
            {
                payments.Add(new
                {
                    paymentId = row["PaymentID"],
                    userName = row["UserName"]?.ToString() ?? "",
                    userLastName = row["UserLastName"]?.ToString() ?? "",
                    userEmail = row["UserEmail"]?.ToString() ?? "",
                    houseTitle = row["HouseTitle"]?.ToString() ?? "",
                    amount = row["Amount"],
                    paymentMethod = row["PaymentMethod"]?.ToString() ?? "",
                    status = row["Status"]?.ToString() ?? "",
                    paymentDate = row["PaymentDate"]
                });
            }
            return Ok(payments);
        }

        [HttpGet("financial-report")]
        public IActionResult GetFinancialReport()
        {
            var report = new { totalIncome = 3000, totalExpense = 500, netIncome = 2500 };
            return Ok(report);
        }

        [HttpGet("favorites/{uid}")]
        public IActionResult GetFavorites(int uid)
        {
            // Şimdilik boş dizi döndür
            return Ok(new object[] { });
        }

        // --- KULLANICI EKLE ---
        [HttpPost("users")]
        public async Task<IActionResult> CreateUser([FromBody] User user)
        {
            var created = await _userService.CreateUser(user);
            return Ok(created);
        }

        // --- KULLANICI GÜNCELLE ---
        [HttpPut("users/{id}")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] User user)
        {
            user.UserID = id;
            var result = await _userService.UpdateUser(user);
            if (!result) return NotFound();
            return Ok(user);
        }

        // --- KULLANICI SİL ---
        [HttpDelete("users/{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var result = await _userService.DeleteUser(id);
            if (!result) return NotFound();
            return Ok(new { deleted = true });
        }

        // --- KULLANICIYI PASİFE/AKTİFE ÇEK ---
        [HttpPatch("users/{id}/status")]
        public async Task<IActionResult> SetUserStatus(int id, [FromBody] bool isActive)
        {
            // Kullanıcıyı bul
            var user = await _userService.GetUserById(id);
            if (user == null) return NotFound();
            user.IsActive = isActive;
            var result = await _userService.UpdateUser(user);
            if (!result) return StatusCode(500);
            return Ok(new { id, isActive });
        }

        // --- TÜM REZERVASYONLARI LİSTELE ---
        [HttpGet("reservations-real")]
        public async Task<IActionResult> GetAllReservations()
        {
            var query = @"SELECT r.ReservationID, r.HouseID, r.TenantID, r.StartDate, r.EndDate, r.Status, r.TotalPrice, r.Guests, h.Title AS HouseTitle, u.Email AS TenantEmail
                          FROM Reservations r
                          JOIN Houses h ON r.HouseID = h.HouseID
                          JOIN Users u ON r.TenantID = u.UserID
                          ORDER BY r.StartDate DESC";
            var table = await _db.ExecuteQueryAsync(query);
            var reservations = new List<object>();
            foreach (DataRow row in table.Rows)
            {
                reservations.Add(new
                {
                    id = row["ReservationID"],
                    house = new {
                        id = row["HouseID"],
                        title = row["HouseTitle"]
                    },
                    tenant = row["TenantEmail"],
                    checkIn = row["StartDate"],
                    checkOut = row["EndDate"],
                    guests = row["Guests"],
                    totalPrice = row["TotalPrice"],
                    status = row["Status"]
                });
            }
            return Ok(reservations);
        }

        // --- REZERVASYON SİL/İPTAL ET ---
        [HttpPut("reservations/{id}/cancel")]
        public async Task<IActionResult> CancelReservation(int id)
        {
            var query = "UPDATE Reservations SET Status = @Status WHERE ReservationID = @ReservationID";
            var parameters = new Dictionary<string, object> {
                {"@Status", "cancelled"},
                {"@ReservationID", id}
            };
            var affected = await _db.ExecuteNonQueryAsync(query, parameters);
            if (affected == 0) return NotFound();
            return Ok(new { cancelled = true });
        }

        [HttpGet("recent-activities")]
        public async Task<IActionResult> GetRecentActivities()
        {
            // Son eklenen kullanıcı (sadece UserID'ye göre)
            var userTable = await _db.ExecuteQueryAsync("SELECT TOP 1 Name, LastName, Email, UserID FROM Users ORDER BY UserID DESC");
            var lastUser = userTable.Rows.Count > 0 ? new {
                Name = userTable.Rows[0]["Name"],
                LastName = userTable.Rows[0]["LastName"],
                Email = userTable.Rows[0]["Email"],
                UserID = userTable.Rows[0]["UserID"]
            } : null;
            // Son rezervasyon
            var resTable = await _db.ExecuteQueryAsync("SELECT TOP 1 ReservationID, StartDate, EndDate, TotalPrice, CreatedAt FROM Reservations ORDER BY CreatedAt DESC");
            var lastReservation = resTable.Rows.Count > 0 ? new {
                ReservationID = resTable.Rows[0]["ReservationID"],
                StartDate = resTable.Rows[0]["StartDate"],
                EndDate = resTable.Rows[0]["EndDate"],
                TotalPrice = resTable.Rows[0]["TotalPrice"],
                CreatedAt = resTable.Rows[0]["CreatedAt"]
            } : null;
            // Son ödeme
            var payTable = await _db.ExecuteQueryAsync("SELECT TOP 1 Amount, PaymentMethod, PaymentDate, Status FROM Payments ORDER BY PaymentDate DESC");
            var lastPayment = payTable.Rows.Count > 0 ? new {
                Amount = payTable.Rows[0]["Amount"],
                PaymentMethod = payTable.Rows[0]["PaymentMethod"],
                PaymentDate = payTable.Rows[0]["PaymentDate"],
                Status = payTable.Rows[0]["Status"]
            } : null;
            return Ok(new { lastUser, lastReservation, lastPayment });
        }
    }
} 