using Microsoft.AspNetCore.Mvc;
using TinyHouse.Api.Data;
using TinyHouse.Api.Models;
using System.Data;
using Microsoft.AspNetCore.Http;
using System.IO;
using TinyHouse.Api.Dtos;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HousesController : ControllerBase
    {
        private readonly DatabaseHelper _db;
        private readonly ILogger<HousesController> _logger;

        public HousesController(DatabaseHelper db, ILogger<HousesController> logger)
        {
            _db = db;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<House>>> GetHouses([FromQuery] bool? available)
        {
            try
            {
                var query = "SELECT * FROM Houses WHERE IsAvailable = 1";
                var parameters = new Dictionary<string, object>();
                var dataTable = await _db.ExecuteQueryAsync(query, parameters);
                var houses = new List<House>();
                foreach (DataRow row in dataTable.Rows)
                {
                    houses.Add(new House
                    {
                        HouseID = row.Table.Columns.Contains("HouseID") && row["HouseID"] != DBNull.Value ? Convert.ToInt32(row["HouseID"]) : 0,
                        OwnerID = row.Table.Columns.Contains("OwnerID") && row["OwnerID"] != DBNull.Value ? Convert.ToInt32(row["OwnerID"]) : 0,
                        Title = row.Table.Columns.Contains("Title") && row["Title"] != DBNull.Value ? row["Title"].ToString() ?? "" : "",
                        Description = row.Table.Columns.Contains("Description") && row["Description"] != DBNull.Value ? row["Description"].ToString() ?? "" : "",
                        City = row.Table.Columns.Contains("City") && row["City"] != DBNull.Value ? row["City"].ToString() ?? "" : "",
                        Country = row.Table.Columns.Contains("Country") && row["Country"] != DBNull.Value ? row["Country"].ToString() ?? "" : "",
                        Bedrooms = row.Table.Columns.Contains("Bedrooms") && row["Bedrooms"] != DBNull.Value ? Convert.ToInt32(row["Bedrooms"]) : 0,
                        Bathrooms = row.Table.Columns.Contains("Bathrooms") && row["Bathrooms"] != DBNull.Value ? Convert.ToInt32(row["Bathrooms"]) : 0,
                        PricePerNight = row.Table.Columns.Contains("PricePerNight") && row["PricePerNight"] != DBNull.Value ? Convert.ToDecimal(row["PricePerNight"]) : 0,
                        CoverImageUrl = row.Table.Columns.Contains("CoverImageUrl") && row["CoverImageUrl"] != DBNull.Value ? row["CoverImageUrl"].ToString() ?? "" : "",
                        TotalReservations = row.Table.Columns.Contains("TotalReservations") && row["TotalReservations"] != DBNull.Value ? Convert.ToInt32(row["TotalReservations"]) : 0,
                        Rating = row.Table.Columns.Contains("Rating") && row["Rating"] != DBNull.Value ? Convert.ToDouble(row["Rating"]) : 0,
                        InteriorImageUrl = row.Table.Columns.Contains("InteriorImageUrl") && row["InteriorImageUrl"] != DBNull.Value ? row["InteriorImageUrl"].ToString() ?? "" : "",
                        IsAvailable = row.Table.Columns.Contains("IsAvailable") && row["IsAvailable"] != DBNull.Value ? (bool?)Convert.ToBoolean(row["IsAvailable"]) : false,
                        HouseType = row.Table.Columns.Contains("HouseType") && row["HouseType"] != DBNull.Value ? row["HouseType"].ToString() ?? "" : "",
                        MaxGuests = row.Table.Columns.Contains("MaxGuests") && row["MaxGuests"] != DBNull.Value ? (int?)Convert.ToInt32(row["MaxGuests"]) : null,
                        Features = row.Table.Columns.Contains("Features") && row["Features"] != DBNull.Value ? row["Features"].ToString() ?? "" : "",
                        Location = row.Table.Columns.Contains("Location") && row["Location"] != DBNull.Value ? row["Location"].ToString() ?? "" : "",
                        CreatedAt = row.Table.Columns.Contains("CreatedAt") && row["CreatedAt"] != DBNull.Value ? Convert.ToDateTime(row["CreatedAt"]) : DateTime.Now,
                        UpdatedAt = row.Table.Columns.Contains("UpdatedAt") && row["UpdatedAt"] != DBNull.Value ? Convert.ToDateTime(row["UpdatedAt"]) : null
                    });
                }
                return Ok(houses);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting houses");
                return StatusCode(500, new { message = $"Evler getirilirken bir hata oluştu: {ex.Message}" });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<House>> GetHouse(int id)
        {
            try
            {
                var query = "SELECT * FROM Houses WHERE HouseID = @HouseID";
                var parameters = new Dictionary<string, object>
                {
                    { "@HouseID", id }
                };
                var dataTable = await _db.ExecuteQueryAsync(query, parameters);
                if (dataTable.Rows.Count == 0)
                {
                    return NotFound(new { message = "Ev bulunamadı." });
                }
                var row = dataTable.Rows[0];
                var house = new House
                {
                    HouseID = row.Table.Columns.Contains("HouseID") && row["HouseID"] != DBNull.Value ? Convert.ToInt32(row["HouseID"]) : 0,
                    OwnerID = row.Table.Columns.Contains("OwnerID") && row["OwnerID"] != DBNull.Value ? Convert.ToInt32(row["OwnerID"]) : 0,
                    Title = row.Table.Columns.Contains("Title") && row["Title"] != DBNull.Value ? row["Title"].ToString() ?? "" : "",
                    Description = row.Table.Columns.Contains("Description") && row["Description"] != DBNull.Value ? row["Description"].ToString() ?? "" : "",
                    City = row.Table.Columns.Contains("City") && row["City"] != DBNull.Value ? row["City"].ToString() ?? "" : "",
                    Country = row.Table.Columns.Contains("Country") && row["Country"] != DBNull.Value ? row["Country"].ToString() ?? "" : "",
                    Bedrooms = row.Table.Columns.Contains("Bedrooms") && row["Bedrooms"] != DBNull.Value ? Convert.ToInt32(row["Bedrooms"]) : 0,
                    Bathrooms = row.Table.Columns.Contains("Bathrooms") && row["Bathrooms"] != DBNull.Value ? Convert.ToInt32(row["Bathrooms"]) : 0,
                    PricePerNight = row.Table.Columns.Contains("PricePerNight") && row["PricePerNight"] != DBNull.Value ? Convert.ToDecimal(row["PricePerNight"]) : 0,
                    CoverImageUrl = row.Table.Columns.Contains("CoverImageUrl") && row["CoverImageUrl"] != DBNull.Value ? row["CoverImageUrl"].ToString() ?? "" : "",
                    TotalReservations = row.Table.Columns.Contains("TotalReservations") && row["TotalReservations"] != DBNull.Value ? Convert.ToInt32(row["TotalReservations"]) : 0,
                    Rating = row.Table.Columns.Contains("Rating") && row["Rating"] != DBNull.Value ? Convert.ToDouble(row["Rating"]) : 0,
                    InteriorImageUrl = row.Table.Columns.Contains("InteriorImageUrl") && row["InteriorImageUrl"] != DBNull.Value ? row["InteriorImageUrl"].ToString() ?? "" : "",
                    IsAvailable = row.Table.Columns.Contains("IsAvailable") && row["IsAvailable"] != DBNull.Value ? (bool?)Convert.ToBoolean(row["IsAvailable"]) : false,
                    HouseType = row.Table.Columns.Contains("HouseType") && row["HouseType"] != DBNull.Value ? row["HouseType"].ToString() ?? "" : "",
                    MaxGuests = row.Table.Columns.Contains("MaxGuests") && row["MaxGuests"] != DBNull.Value ? (int?)Convert.ToInt32(row["MaxGuests"]) : null,
                    Features = row.Table.Columns.Contains("Features") && row["Features"] != DBNull.Value ? row["Features"].ToString() ?? "" : "",
                    Location = row.Table.Columns.Contains("Location") && row["Location"] != DBNull.Value ? row["Location"].ToString() ?? "" : "",
                    CreatedAt = row.Table.Columns.Contains("CreatedAt") && row["CreatedAt"] != DBNull.Value ? Convert.ToDateTime(row["CreatedAt"]) : DateTime.Now,
                    UpdatedAt = row.Table.Columns.Contains("UpdatedAt") && row["UpdatedAt"] != DBNull.Value ? Convert.ToDateTime(row["UpdatedAt"]) : null
                };
                return Ok(house);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting house with id: {Id}", id);
                return StatusCode(500, new { message = $"Ev getirilirken bir hata oluştu: {ex.Message}" });
            }
        }

        [HttpGet("by-owner")]
        public async Task<IActionResult> GetHousesByOwner([FromQuery] string email)
        {
            try
            {
                var query = "SELECT * FROM Houses WHERE OwnerID = (SELECT UserID FROM Users WHERE Email = @Email)";
                var parameters = new Dictionary<string, object> { { "@Email", email } };
                var dataTable = await _db.ExecuteQueryAsync(query, parameters);
                var houses = new List<House>();
                foreach (DataRow row in dataTable.Rows)
                {
                    houses.Add(new House
                    {
                        HouseID = row.Table.Columns.Contains("HouseID") && row["HouseID"] != DBNull.Value ? Convert.ToInt32(row["HouseID"]) : 0,
                        OwnerID = row.Table.Columns.Contains("OwnerID") && row["OwnerID"] != DBNull.Value ? Convert.ToInt32(row["OwnerID"]) : 0,
                        Title = row.Table.Columns.Contains("Title") && row["Title"] != DBNull.Value ? row["Title"].ToString() ?? "" : "",
                        Description = row.Table.Columns.Contains("Description") && row["Description"] != DBNull.Value ? row["Description"].ToString() ?? "" : "",
                        City = row.Table.Columns.Contains("City") && row["City"] != DBNull.Value ? row["City"].ToString() ?? "" : "",
                        Country = row.Table.Columns.Contains("Country") && row["Country"] != DBNull.Value ? row["Country"].ToString() ?? "" : "",
                        Bedrooms = row.Table.Columns.Contains("Bedrooms") && row["Bedrooms"] != DBNull.Value ? Convert.ToInt32(row["Bedrooms"]) : 0,
                        Bathrooms = row.Table.Columns.Contains("Bathrooms") && row["Bathrooms"] != DBNull.Value ? Convert.ToInt32(row["Bathrooms"]) : 0,
                        PricePerNight = row.Table.Columns.Contains("PricePerNight") && row["PricePerNight"] != DBNull.Value ? Convert.ToDecimal(row["PricePerNight"]) : 0,
                        CoverImageUrl = row.Table.Columns.Contains("CoverImageUrl") && row["CoverImageUrl"] != DBNull.Value ? row["CoverImageUrl"].ToString() ?? "" : "",
                        TotalReservations = row.Table.Columns.Contains("TotalReservations") && row["TotalReservations"] != DBNull.Value ? Convert.ToInt32(row["TotalReservations"]) : 0,
                        Rating = row.Table.Columns.Contains("Rating") && row["Rating"] != DBNull.Value ? Convert.ToDouble(row["Rating"]) : 0,
                        InteriorImageUrl = row.Table.Columns.Contains("InteriorImageUrl") && row["InteriorImageUrl"] != DBNull.Value ? row["InteriorImageUrl"].ToString() ?? "" : "",
                        IsAvailable = row.Table.Columns.Contains("IsAvailable") && row["IsAvailable"] != DBNull.Value ? (bool?)Convert.ToBoolean(row["IsAvailable"]) : false,
                        HouseType = row.Table.Columns.Contains("HouseType") && row["HouseType"] != DBNull.Value ? row["HouseType"].ToString() ?? "" : "",
                        MaxGuests = row.Table.Columns.Contains("MaxGuests") && row["MaxGuests"] != DBNull.Value ? (int?)Convert.ToInt32(row["MaxGuests"]) : null,
                        Features = row.Table.Columns.Contains("Features") && row["Features"] != DBNull.Value ? row["Features"].ToString() ?? "" : "",
                        Location = row.Table.Columns.Contains("Location") && row["Location"] != DBNull.Value ? row["Location"].ToString() ?? "" : "",
                        CreatedAt = row.Table.Columns.Contains("CreatedAt") && row["CreatedAt"] != DBNull.Value ? Convert.ToDateTime(row["CreatedAt"]) : DateTime.Now,
                        UpdatedAt = row.Table.Columns.Contains("UpdatedAt") && row["UpdatedAt"] != DBNull.Value ? Convert.ToDateTime(row["UpdatedAt"]) : null
                    });
                }
                return Ok(houses);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting houses by owner");
                return StatusCode(500, new { message = $"Evler getirilirken bir hata oluştu: {ex.Message}" });
            }
        }

        [HttpGet("popular")]
        public async Task<ActionResult<IEnumerable<House>>> GetPopularHouses()
        {
            try
            {
                var query = @"
                    SELECT TOP 6 h.HouseID, h.OwnerID, h.Title, h.Description, h.City, h.Country,
                           h.Bedrooms, h.Bathrooms, h.PricePerNight, h.CoverImageUrl,
                           h.InteriorImageUrl, h.IsAvailable, h.HouseType, h.MaxGuests,
                           h.Features, h.Location,
                           ISNULL(COUNT(r.ReservationID), 0) as TotalReservations,
                           ISNULL(AVG(CAST(r.Rating as FLOAT)), 0) as Rating
                    FROM Houses h
                    LEFT JOIN Reservations r ON h.HouseID = r.HouseID
                    GROUP BY h.HouseID, h.OwnerID, h.Title, h.Description, h.City, h.Country,
                             h.Bedrooms, h.Bathrooms, h.PricePerNight, h.CoverImageUrl,
                             h.InteriorImageUrl, h.IsAvailable, h.HouseType, h.MaxGuests,
                             h.Features, h.Location
                    ORDER BY TotalReservations DESC, Rating DESC";
                try
                {
                    var dataTable = await _db.ExecuteQueryAsync(query);
                    var houses = new List<House>();
                    foreach (DataRow row in dataTable.Rows)
                    {
                        houses.Add(new House
                        {
                            HouseID = row.Table.Columns.Contains("HouseID") && row["HouseID"] != DBNull.Value ? Convert.ToInt32(row["HouseID"]) : 0,
                            OwnerID = row.Table.Columns.Contains("OwnerID") && row["OwnerID"] != DBNull.Value ? Convert.ToInt32(row["OwnerID"]) : 0,
                            Title = row.Table.Columns.Contains("Title") && row["Title"] != DBNull.Value ? row["Title"].ToString() ?? "" : "",
                            Description = row.Table.Columns.Contains("Description") && row["Description"] != DBNull.Value ? row["Description"].ToString() ?? "" : "",
                            City = row.Table.Columns.Contains("City") && row["City"] != DBNull.Value ? row["City"].ToString() ?? "" : "",
                            Country = row.Table.Columns.Contains("Country") && row["Country"] != DBNull.Value ? row["Country"].ToString() ?? "" : "",
                            Bedrooms = row.Table.Columns.Contains("Bedrooms") && row["Bedrooms"] != DBNull.Value ? Convert.ToInt32(row["Bedrooms"]) : 0,
                            Bathrooms = row.Table.Columns.Contains("Bathrooms") && row["Bathrooms"] != DBNull.Value ? Convert.ToInt32(row["Bathrooms"]) : 0,
                            PricePerNight = row.Table.Columns.Contains("PricePerNight") && row["PricePerNight"] != DBNull.Value ? Convert.ToDecimal(row["PricePerNight"]) : 0,
                            CoverImageUrl = row.Table.Columns.Contains("CoverImageUrl") && row["CoverImageUrl"] != DBNull.Value ? row["CoverImageUrl"].ToString() ?? "" : "",
                            TotalReservations = row.Table.Columns.Contains("TotalReservations") && row["TotalReservations"] != DBNull.Value ? Convert.ToInt32(row["TotalReservations"]) : 0,
                            Rating = row.Table.Columns.Contains("Rating") && row["Rating"] != DBNull.Value ? Convert.ToDouble(row["Rating"]) : 0,
                            InteriorImageUrl = row.Table.Columns.Contains("InteriorImageUrl") && row["InteriorImageUrl"] != DBNull.Value ? row["InteriorImageUrl"].ToString() ?? "" : "",
                            IsAvailable = row.Table.Columns.Contains("IsAvailable") && row["IsAvailable"] != DBNull.Value ? (bool?)Convert.ToBoolean(row["IsAvailable"]) : false,
                            HouseType = row.Table.Columns.Contains("HouseType") && row["HouseType"] != DBNull.Value ? row["HouseType"].ToString() ?? "" : "",
                            MaxGuests = row.Table.Columns.Contains("MaxGuests") && row["MaxGuests"] != DBNull.Value ? (int?)Convert.ToInt32(row["MaxGuests"]) : null,
                            Features = row.Table.Columns.Contains("Features") && row["Features"] != DBNull.Value ? row["Features"].ToString() ?? "" : "",
                            Location = row.Table.Columns.Contains("Location") && row["Location"] != DBNull.Value ? row["Location"].ToString() ?? "" : "",
                            CreatedAt = row.Table.Columns.Contains("CreatedAt") && row["CreatedAt"] != DBNull.Value ? Convert.ToDateTime(row["CreatedAt"]) : DateTime.Now,
                            UpdatedAt = row.Table.Columns.Contains("UpdatedAt") && row["UpdatedAt"] != DBNull.Value ? Convert.ToDateTime(row["UpdatedAt"]) : null
                        });
                    }
                    return Ok(houses);
                }
                catch (Exception ex)
                {
                    // Eğer karmaşık sorgu hata verirse, basit sorguya düş
                    var simpleQuery = "SELECT TOP 6 * FROM Houses ORDER BY HouseID DESC";
                    var dataTable = await _db.ExecuteQueryAsync(simpleQuery);
                    var houses = new List<House>();
                    foreach (DataRow row in dataTable.Rows)
                    {
                        houses.Add(new House
                        {
                            HouseID = row.Table.Columns.Contains("HouseID") && row["HouseID"] != DBNull.Value ? Convert.ToInt32(row["HouseID"]) : 0,
                            OwnerID = row.Table.Columns.Contains("OwnerID") && row["OwnerID"] != DBNull.Value ? Convert.ToInt32(row["OwnerID"]) : 0,
                            Title = row.Table.Columns.Contains("Title") && row["Title"] != DBNull.Value ? row["Title"].ToString() ?? "" : "",
                            Description = row.Table.Columns.Contains("Description") && row["Description"] != DBNull.Value ? row["Description"].ToString() ?? "" : "",
                            City = row.Table.Columns.Contains("City") && row["City"] != DBNull.Value ? row["City"].ToString() ?? "" : "",
                            Country = row.Table.Columns.Contains("Country") && row["Country"] != DBNull.Value ? row["Country"].ToString() ?? "" : "",
                            Bedrooms = row.Table.Columns.Contains("Bedrooms") && row["Bedrooms"] != DBNull.Value ? Convert.ToInt32(row["Bedrooms"]) : 0,
                            Bathrooms = row.Table.Columns.Contains("Bathrooms") && row["Bathrooms"] != DBNull.Value ? Convert.ToInt32(row["Bathrooms"]) : 0,
                            PricePerNight = row.Table.Columns.Contains("PricePerNight") && row["PricePerNight"] != DBNull.Value ? Convert.ToDecimal(row["PricePerNight"]) : 0,
                            CoverImageUrl = row.Table.Columns.Contains("CoverImageUrl") && row["CoverImageUrl"] != DBNull.Value ? row["CoverImageUrl"].ToString() ?? "" : "",
                            TotalReservations = 0,
                            Rating = 0,
                            InteriorImageUrl = row.Table.Columns.Contains("InteriorImageUrl") && row["InteriorImageUrl"] != DBNull.Value ? row["InteriorImageUrl"].ToString() ?? "" : "",
                            IsAvailable = row.Table.Columns.Contains("IsAvailable") && row["IsAvailable"] != DBNull.Value ? (bool?)Convert.ToBoolean(row["IsAvailable"]) : false,
                            HouseType = row.Table.Columns.Contains("HouseType") && row["HouseType"] != DBNull.Value ? row["HouseType"].ToString() ?? "" : "",
                            MaxGuests = row.Table.Columns.Contains("MaxGuests") && row["MaxGuests"] != DBNull.Value ? (int?)Convert.ToInt32(row["MaxGuests"]) : null,
                            Features = row.Table.Columns.Contains("Features") && row["Features"] != DBNull.Value ? row["Features"].ToString() ?? "" : "",
                            Location = row.Table.Columns.Contains("Location") && row["Location"] != DBNull.Value ? row["Location"].ToString() ?? "" : "",
                            CreatedAt = row.Table.Columns.Contains("CreatedAt") && row["CreatedAt"] != DBNull.Value ? Convert.ToDateTime(row["CreatedAt"]) : DateTime.Now,
                            UpdatedAt = row.Table.Columns.Contains("UpdatedAt") && row["UpdatedAt"] != DBNull.Value ? Convert.ToDateTime(row["UpdatedAt"]) : null
                        });
                    }
                    return Ok(houses);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting popular houses");
                return StatusCode(500, new { message = $"Popüler evler getirilirken bir hata oluştu: {ex.Message}" });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateHouse(int id, [FromBody] House house)
        {
            try
            {
                var query = @"UPDATE Houses 
                            SET Title = @Title,
                                Description = @Description,
                                City = @City,
                                Country = @Country,
                                Bedrooms = @Bedrooms,
                                Bathrooms = @Bathrooms,
                                PricePerNight = @PricePerNight,
                                CoverImageUrl = @CoverImageUrl,
                                InteriorImageUrl = @InteriorImageUrl,
                                IsAvailable = @IsAvailable,
                                HouseType = @HouseType,
                                MaxGuests = @MaxGuests,
                                Features = @Features,
                                Location = @Location,
                                UpdatedAt = GETDATE()
                            WHERE HouseID = @HouseID";

                var parameters = new Dictionary<string, object>
                {
                    {"@HouseID", id},
                    {"@Title", house.Title},
                    {"@Description", house.Description},
                    {"@City", house.City},
                    {"@Country", house.Country},
                    {"@Bedrooms", house.Bedrooms},
                    {"@Bathrooms", house.Bathrooms},
                    {"@PricePerNight", house.PricePerNight},
                    {"@CoverImageUrl", house.CoverImageUrl},
                    {"@InteriorImageUrl", house.InteriorImageUrl},
                    {"@IsAvailable", house.IsAvailable ?? true},
                    {"@HouseType", house.HouseType},
                    {"@MaxGuests", house.MaxGuests ?? 2},
                    {"@Features", house.Features ?? ""},
                    {"@Location", house.Location}
                };

                var affected = await _db.ExecuteNonQueryAsync(query, parameters);
                if (affected == 0)
                {
                    return NotFound(new { message = "İlan bulunamadı." });
                }

                return Ok(new { message = "İlan başarıyla güncellendi." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating house with id: {Id}", id);
                return StatusCode(500, new { message = $"İlan güncellenirken bir hata oluştu: {ex.Message}" });
            }
        }

        [HttpPut("{id}/set-available")]
        public async Task<IActionResult> SetAvailable(int id, [FromBody] bool isAvailable)
        {
            var query = "UPDATE Houses SET IsAvailable = @IsAvailable WHERE HouseID = @HouseID";
            var parameters = new Dictionary<string, object>
            {
                { "@IsAvailable", isAvailable },
                { "@HouseID", id }
            };
            var affected = await _db.ExecuteNonQueryAsync(query, parameters);
            if (affected == 0)
                return NotFound(new { message = "Ev bulunamadı." });
            return Ok(new { message = "Ev durumu güncellendi." });
        }

        [HttpPost]
        public async Task<IActionResult> AddHouse([FromForm] HouseDto house)
        {
            // VALIDASYONLAR
            if (house.CoverImage == null)
                return BadRequest(new { message = "Kapak görseli zorunludur." });

            if (house.InteriorImages == null || house.InteriorImages.Count < 1)
                return BadRequest(new { message = "En az 1 iç mekan fotoğrafı yüklemelisiniz." });

            if (house.InteriorImages.Count > 5)
                return BadRequest(new { message = "En fazla 5 iç mekan fotoğrafı yükleyebilirsiniz." });

            if (string.IsNullOrWhiteSpace(house.Title) || string.IsNullOrWhiteSpace(house.Description))
                return BadRequest(new { message = "Başlık ve açıklama zorunludur." });

            if (string.IsNullOrWhiteSpace(house.City) || string.IsNullOrWhiteSpace(house.Country))
                return BadRequest(new { message = "Şehir ve ülke zorunludur." });

            if (house.Bedrooms < 1 || house.Bathrooms < 1)
                return BadRequest(new { message = "Yatak odası ve banyo sayısı en az 1 olmalıdır." });

            if (house.PricePerNight <= 0)
                return BadRequest(new { message = "Fiyat 0'dan büyük olmalıdır." });

            if (house.MaxGuests < 1)
                return BadRequest(new { message = "Maksimum misafir sayısı en az 1 olmalıdır." });

            // Features alanı null ise boş string olarak set et
            if (house.Features == null)
                house.Features = "";

            // OwnerEmail ile UserID bul
            int ownerId = 0;
            if (!string.IsNullOrEmpty(house.OwnerEmail))
            {
                var ownerIdObj = await _db.ExecuteScalarAsync("SELECT UserID FROM Users WHERE Email = @Email", new Dictionary<string, object> { { "@Email", house.OwnerEmail } });
                if (ownerIdObj != null && int.TryParse(ownerIdObj.ToString(), out int parsedId))
                    ownerId = parsedId;
            }
            if (ownerId == 0)
                return BadRequest(new { message = "Geçersiz ev sahibi e-posta adresi." });

            // 1. Kapak görselini kaydet
            string coverImagePath = null;
            if (house.CoverImage != null)
            {
                var fileName = Guid.NewGuid() + System.IO.Path.GetExtension(house.CoverImage.FileName);
                var filePath = Path.Combine("wwwroot/uploads", fileName);
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await house.CoverImage.CopyToAsync(stream);
                }
                coverImagePath = "/uploads/" + fileName;
            }

            // 2. İç mekan fotoğraflarını kaydet
            var interiorImagePaths = new List<string>();
            if (house.InteriorImages != null)
            {
                foreach (var img in house.InteriorImages)
                {
                    var fileName = Guid.NewGuid() + System.IO.Path.GetExtension(img.FileName);
                    var filePath = Path.Combine("wwwroot/uploads", fileName);
                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await img.CopyToAsync(stream);
                    }
                    interiorImagePaths.Add("/uploads/" + fileName);
                }
            }

            // 3. SQL insert işlemi (interiorImagePaths'i virgülle birleştirerek kaydediyoruz)
            var query = @"INSERT INTO Houses (OwnerID, Title, Description, City, Country, Bedrooms, Bathrooms, PricePerNight, CoverImageUrl, InteriorImageUrl, IsAvailable, HouseType, MaxGuests, Features, Location, CreatedAt)
                          VALUES (@OwnerID, @Title, @Description, @City, @Country, @Bedrooms, @Bathrooms, @PricePerNight, @CoverImageUrl, @InteriorImageUrl, @IsAvailable, @HouseType, @MaxGuests, @Features, @Location, GETDATE())";
            var parameters = new Dictionary<string, object>
            {
                {"@OwnerID", ownerId},
                {"@Title", house.Title},
                {"@Description", house.Description},
                {"@City", house.City},
                {"@Country", house.Country},
                {"@Bedrooms", house.Bedrooms},
                {"@Bathrooms", house.Bathrooms},
                {"@PricePerNight", house.PricePerNight},
                {"@CoverImageUrl", coverImagePath ?? ""},
                {"@InteriorImageUrl", string.Join(",", interiorImagePaths)},
                {"@IsAvailable", true},
                {"@HouseType", house.HouseType},
                {"@MaxGuests", house.MaxGuests},
                {"@Features", house.Features},
                {"@Location", house.Location ?? ""}
            };
            var affected = await _db.ExecuteNonQueryAsync(query, parameters);
            if (affected == 0)
                return StatusCode(500, new { message = "Ev eklenemedi." });
            return Ok(new { message = "Ev başarıyla eklendi." });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteHouse(int id)
        {
            try
            {
                // Eğer ilişkili rezervasyon/ödeme varsa önce onları silmek gerekebilir!
                var query = "DELETE FROM Houses WHERE HouseID = @HouseID";
                var parameters = new Dictionary<string, object> { { "@HouseID", id } };
                var affected = await _db.ExecuteNonQueryAsync(query, parameters);
                if (affected == 0)
                    return NotFound(new { message = "Ev bulunamadı." });
                return Ok(new { message = "Ev başarıyla silindi." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting house with id: {Id}", id);
                return StatusCode(500, new { message = $"Ev silinirken bir hata oluştu: {ex.Message}" });
            }
        }
    }
} 