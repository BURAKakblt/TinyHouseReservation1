using Microsoft.AspNetCore.Mvc;
using TinyHouse.Api.Data;
using TinyHouse.Api.Models;
using System.Data;

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
                var query = "SELECT * FROM Houses";
                var parameters = new Dictionary<string, object>();

                if (available.HasValue)
                {
                    query += " WHERE IsAvailable = @IsAvailable";
                    parameters.Add("@IsAvailable", available.Value);
                }

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
                        IsAvailable = row.Table.Columns.Contains("IsAvailable") && row["IsAvailable"] != DBNull.Value ? (bool?)Convert.ToBoolean(row["IsAvailable"]) : null,
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
                    IsAvailable = row.Table.Columns.Contains("IsAvailable") && row["IsAvailable"] != DBNull.Value ? (bool?)Convert.ToBoolean(row["IsAvailable"]) : null,
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
                        IsAvailable = row.Table.Columns.Contains("IsAvailable") && row["IsAvailable"] != DBNull.Value ? (bool?)Convert.ToBoolean(row["IsAvailable"]) : null,
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
                            IsAvailable = row.Table.Columns.Contains("IsAvailable") && row["IsAvailable"] != DBNull.Value ? (bool?)Convert.ToBoolean(row["IsAvailable"]) : null,
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
                            IsAvailable = row.Table.Columns.Contains("IsAvailable") && row["IsAvailable"] != DBNull.Value ? (bool?)Convert.ToBoolean(row["IsAvailable"]) : null,
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
                    {"@Features", house.Features},
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
    }
} 