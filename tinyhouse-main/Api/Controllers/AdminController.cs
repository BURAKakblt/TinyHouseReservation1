using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/admin")]
    public class AdminController : ControllerBase
    {
        [HttpGet("statistics")]
        public IActionResult GetStatistics()
        {
            // Dummy statistics data
            var statistics = new
            {
                UserStats = new {
                    TotalUsers = 100,
                    ActiveUsers = 80,
                    NewUsers = 10
                },
                TotalReservations = 50,
                TotalPayments = 40,
                TotalReviews = 30,
                ReservationTrends = new[]
                {
                    new { Month = "Ocak", Count = 5 },
                    new { Month = "Şubat", Count = 8 },
                    new { Month = "Mart", Count = 10 },
                    new { Month = "Nisan", Count = 7 },
                    new { Month = "Mayıs", Count = 12 },
                    new { Month = "Haziran", Count = 8 }
                }
            };
            return Ok(statistics);
        }

        [HttpGet("users")]
        public IActionResult GetUsers()
        {
            var users = new[]
            {
                new { id = 1, name = "Admin User", email = "admin@gmail.com", role = "admin", IsActive = true },
                new { id = 2, name = "Test User", email = "test@gmail.com", role = "user", IsActive = true }
            };
            return Ok(users);
        }

        [HttpGet("listings")]
        public IActionResult GetListings()
        {
            var listings = new[]
            {
                new { id = 1, title = "Ev 1", city = "Ankara", country = "Türkiye" },
                new { id = 2, title = "Ev 2", city = "İstanbul", country = "Türkiye" }
            };
            return Ok(listings);
        }

        [HttpGet("reservations")]
        public IActionResult GetReservations()
        {
            var reservations = new[]
            {
                new { id = 1, user = "Test User", house = "Ev 1", status = "active" },
                new { id = 2, user = "Admin User", house = "Ev 2", status = "completed" }
            };
            return Ok(reservations);
        }

        [HttpGet("payments")]
        public IActionResult GetPayments()
        {
            var payments = new[]
            {
                new { id = 1, user = "Test User", amount = 1000, status = "completed" },
                new { id = 2, user = "Admin User", amount = 2000, status = "pending" }
            };
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
    }
} 