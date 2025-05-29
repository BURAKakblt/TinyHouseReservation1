using Microsoft.Extensions.Configuration;
using Microsoft.Data.SqlClient;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Dapper;
using TinyHouse.Api.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using System.Data;
using Microsoft.AspNetCore.Http.Features;
using System.IO;
using Api.Models;
using Microsoft.AspNetCore.Mvc;
using System.Linq;
using Api.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        builder =>
        {
            builder.AllowAnyOrigin()
                   .AllowAnyMethod()
                   .AllowAnyHeader();
        });
});

// Form dosya yükleme limitini artır
builder.Services.Configure<FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = 10 * 1024 * 1024; // 10MB
});

var jwtSection = builder.Configuration.GetSection("Jwt");
var jwtKey     = Encoding.UTF8.GetBytes(jwtSection["Key"]);

// Configure JWT Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes("your-256-bit-secret")), // Replace with actual secret key
            ValidateIssuer = false,
            ValidateAudience = false
        };
    });

// Add services
builder.Services.AddScoped<IUserService, UserService>();

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Use CORS
app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

// Statik dosyaları sun
app.UseStaticFiles();

// Veritabanı bağlantı dizesi
var connectionString = "Server=localhost;Database=TinyHouseDB;Trusted_Connection=True;TrustServerCertificate=True;";

// 3️⃣ Mevcut endpoint tanımlamaları

// Sahip olduğu evleri email'e göre listele
app.MapGet("/api/houses/by-owner", async (string email, IConfiguration configuration) =>
{
    if (string.IsNullOrWhiteSpace(email))
        return Results.BadRequest(new { message = "Email query parametresi gerekli." });

    using var conn = new SqlConnection(connectionString);
    await conn.OpenAsync();

    // Önce Users tablosundan bu email'in Id'sini al
    var ownerId = await conn.ExecuteScalarAsync<int?>(
        "SELECT UserId FROM Users WHERE Email = @Email",
        new { Email = email }
    );
    if (ownerId == null)
        return Results.NotFound(new { message = "Kullanıcı bulunamadı." });

    // Sonra Houses tablosundan bu OwnerID'ye ait evleri çek
    var houses = await conn.QueryAsync<House>(
        "SELECT * FROM Houses WHERE OwnerID = @OwnerId",
        new { OwnerId = ownerId.Value }
    );

    return Results.Ok(houses);
});

// Rezervasyon Oluştur
app.MapPost("/api/reservations", async (CreateReservationDto dto) =>
{
    using var conn = new SqlConnection(connectionString);
    await conn.OpenAsync();
    var p = new DynamicParameters();
    p.Add("@HouseID",          dto.HouseID);
    p.Add("@TenantID",         dto.TenantID);
    p.Add("@StartDate",        dto.StartDate.Date);
    p.Add("@EndDate",          dto.EndDate.Date);
    p.Add("@NewReservationID",
          dbType: System.Data.DbType.Int32,
          direction: System.Data.ParameterDirection.Output);

    await conn.ExecuteAsync(
        "dbo.sp_CreateReservation",
        p,
        commandType: System.Data.CommandType.StoredProcedure
    );

    int newId = p.Get<int>("@NewReservationID");
    return Results.Created($"/api/reservations/{newId}", new { ReservationID = newId });
});

/// Signup - Kayıt Olma
app.MapPost("/api/signup", async (SignupRequest req) =>
{
    using var conn = new SqlConnection(connectionString);
    await conn.OpenAsync();

    var sql = @"
        INSERT INTO Users (Username, Email, PasswordHash, RoleID)
        VALUES (@Username, @Email, @PasswordHash, @RoleID)";
    var cmd = new SqlCommand(sql, conn);
    cmd.Parameters.AddWithValue("@Username",    req.Username);
    cmd.Parameters.AddWithValue("@Email",       req.Email);
    cmd.Parameters.AddWithValue("@PasswordHash", BCrypt.Net.BCrypt.HashPassword(req.Password));
    cmd.Parameters.AddWithValue("@RoleID",      req.RoleID);

    try
    {
        await cmd.ExecuteNonQueryAsync();
        return Results.Ok(new { message = "Kayıt başarılı!" });
    }
    catch (SqlException ex)
    {
        if (ex.Message.Contains("UNIQUE KEY"))
            return Results.BadRequest(new { message = "Bu kullanıcı adı veya e-posta zaten kayıtlı." });
        return Results.BadRequest(new { message = "Kayıt başarısız: " + ex.Message });
    }
})
.AllowAnonymous();

// Evleri ID'ye göre silme
app.MapDelete("/api/houses/{id:int}", async (int id) =>
{
    using var conn = new SqlConnection(connectionString);
    await conn.OpenAsync();

    var cmd = new SqlCommand("DELETE FROM Houses WHERE HouseID = @Id", conn);
    cmd.Parameters.AddWithValue("@Id", id);

    int affected = await cmd.ExecuteNonQueryAsync();
    return affected == 0 
        ? Results.NotFound(new { message = "Ev bulunamadı." }) 
        : Results.Ok(new { message = "Ev başarıyla silindi." });
});

// İlan düzenleme endpoint'i
app.MapPut("/api/houses/{id}", async (int id, HttpContext context) =>
{
    try
    {
        var form = await context.Request.ReadFormAsync();
        var title = form["Title"].ToString();
        var description = form["Description"].ToString();
        var city = form["City"].ToString();
        var country = form["Country"].ToString();
        var bedroomCount = int.Parse(form["BedroomCount"].ToString());
        var bathroomCount = int.Parse(form["BathroomCount"].ToString());
        var pricePerNight = decimal.Parse(form["PricePerNight"].ToString());
        var rating = decimal.Parse(form["Rating"].ToString());

        // İlanı güncelle
        var updateQuery = @"
            UPDATE Houses 
            SET Title = @Title,
                Description = @Description,
                City = @City,
                Country = @Country,
                BedroomCount = @BedroomCount,
                BathroomCount = @BathroomCount,
                PricePerNight = @PricePerNight,
                Rating = @Rating
            WHERE Id = @Id";

        using (var connection = new SqlConnection(connectionString))
        {
            await connection.OpenAsync();
            await connection.ExecuteAsync(updateQuery, new
            {
                Id = id,
                Title = title,
                Description = description,
                City = city,
                Country = country,
                BedroomCount = bedroomCount,
                BathroomCount = bathroomCount,
                PricePerNight = pricePerNight,
                Rating = rating
            });
        }

        // Kapak fotoğrafı güncelleme
        if (form.Files.Any(f => f.Name == "CoverImage"))
        {
            var coverImage = form.Files.First(f => f.Name == "CoverImage");
            var coverImagePath = Path.Combine("wwwroot", "images", "houses", $"cover_{id}{Path.GetExtension(coverImage.FileName)}");
            using (var stream = new FileStream(coverImagePath, FileMode.Create))
            {
                await coverImage.CopyToAsync(stream);
            }

            var updateCoverImageQuery = "UPDATE Houses SET CoverImage = @CoverImage WHERE Id = @Id";
            using (var connection = new SqlConnection(connectionString))
            {
                await connection.OpenAsync();
                await connection.ExecuteAsync(updateCoverImageQuery, new
                {
                    Id = id,
                    CoverImage = $"/images/houses/cover_{id}{Path.GetExtension(coverImage.FileName)}"
                });
            }
        }

        // İç mekan fotoğrafları güncelleme
        if (form.Files.Any(f => f.Name == "InteriorImages"))
        {
            var interiorImages = form.Files.Where(f => f.Name == "InteriorImages");
            var imagePaths = new List<string>();

            foreach (var image in interiorImages)
            {
                var imagePath = Path.Combine("wwwroot", "images", "houses", $"interior_{id}_{imagePaths.Count}{Path.GetExtension(image.FileName)}");
                using (var stream = new FileStream(imagePath, FileMode.Create))
                {
                    await image.CopyToAsync(stream);
                }
                imagePaths.Add($"/images/houses/interior_{id}_{imagePaths.Count}{Path.GetExtension(image.FileName)}");
            }

            var updateInteriorImagesQuery = "UPDATE Houses SET InteriorImages = @InteriorImages WHERE Id = @Id";
            using (var connection = new SqlConnection(connectionString))
            {
                await connection.OpenAsync();
                await connection.ExecuteAsync(updateInteriorImagesQuery, new
                {
                    Id = id,
                    InteriorImages = string.Join(",", imagePaths)
                });
            }
        }

        return Results.Ok(new { message = "İlan başarıyla güncellendi." });
    }
    catch (Exception ex)
    {
        return Results.BadRequest(new { message = ex.Message });
    }
})
.RequireAuthorization();

// İlan durumunu güncelleme endpoint'i
app.MapPut("/api/houses/{id:int}/status", async (int id, HttpRequest request) =>
{
    try
    {
        var body = await new StreamReader(request.Body).ReadToEndAsync();
        var data = System.Text.Json.JsonDocument.Parse(body);
        if (!data.RootElement.TryGetProperty("isActive", out var isActiveProp))
            return Results.BadRequest(new { message = "isActive alanı gerekli." });
        bool isActive = isActiveProp.GetBoolean();

        using var conn = new SqlConnection(connectionString);
        await conn.OpenAsync();
        var cmd = new SqlCommand("UPDATE Houses SET IsActive = @IsActive WHERE HouseID = @Id", conn);
        cmd.Parameters.AddWithValue("@IsActive", isActive);
        cmd.Parameters.AddWithValue("@Id", id);
        int affected = await cmd.ExecuteNonQueryAsync();
        return affected > 0
            ? Results.Ok(new { message = "Durum güncellendi." })
            : Results.NotFound(new { message = "Ev bulunamadı." });
    }
    catch (Exception ex)
    {
        return Results.BadRequest(new { message = ex.Message });
    }
});

// Rezervasyon durumunu güncelleme endpoint'i
app.MapPut("/api/reservations/{id:int}/status", async (int id, HttpRequest request) =>
{
    try
    {
        var body = await new StreamReader(request.Body).ReadToEndAsync();
        var data = System.Text.Json.JsonDocument.Parse(body);
        if (!data.RootElement.TryGetProperty("status", out var statusProp))
            return Results.BadRequest(new { message = "status alanı gerekli." });
        string status = statusProp.GetString();

        using var conn = new SqlConnection(connectionString);
        await conn.OpenAsync();
        var cmd = new SqlCommand("UPDATE Reservations SET Status = @Status WHERE ReservationID = @Id", conn);
        cmd.Parameters.AddWithValue("@Status", status);
        cmd.Parameters.AddWithValue("@Id", id);
        int affected = await cmd.ExecuteNonQueryAsync();
        return affected > 0
            ? Results.Ok(new { message = "Rezervasyon durumu güncellendi." })
            : Results.NotFound(new { message = "Rezervasyon bulunamadı." });
    }
    catch (Exception ex)
    {
        return Results.BadRequest(new { message = ex.Message });
    }
});

/*
// Evleri email'e göre listeleme
app.MapGet("/api/houses/by-owner", async (string email, IConfiguration configuration) =>
{
    var connectionString = configuration.GetConnectionString("DefaultConnection");
    using var conn = new SqlConnection(connectionString);
    await conn.OpenAsync();

    var userId = await conn.ExecuteScalarAsync<int?>(
        "SELECT UserID FROM Users WHERE Email = @Email",
        new { Email = email }
    );
    if (userId == null)
        return Results.BadRequest(new { message = "Kullanıcı bulunamadı." });

    var list = await conn.QueryAsync<House>(
        "SELECT * FROM Houses WHERE OwnerID = @OwnerId",
        new { OwnerId = userId.Value }
    );
    return Results.Ok(list);
});

*/

// Ev Ekleme (POST)
app.MapPost("/api/houses", async (HttpRequest request, IConfiguration configuration) =>
{
    try
    {
        var form = await request.ReadFormAsync();

         string title = form["Title"];
        if (string.IsNullOrWhiteSpace(title))
            return Results.BadRequest(new { message = "Başlık (Title) gereklidir." });

        string city = form["City"];
        string country = form["Country"];
        string description = form["Description"];
        string ownerEmail = form["OwnerEmail"];
        if (string.IsNullOrWhiteSpace(ownerEmail))
            return Results.BadRequest(new { message = "Ev sahibi email gereklidir." });

        if (!int.TryParse(form["BedroomCount"], out int bedroomCount) ||
            !int.TryParse(form["BathroomCount"], out int bathroomCount) ||
            !decimal.TryParse(form["PricePerNight"], out decimal price) ||
            !decimal.TryParse(form["Rating"], out decimal rating))
        {
            return Results.BadRequest(new { message = "Sayısal değerlerde geçersiz giriş." });
        }
        
        

        // Kullanıcıyı bul
        int ownerId;
        using (var conn = new SqlConnection(connectionString))
        {
            await conn.OpenAsync();
            var cmd = new SqlCommand("SELECT UserID FROM Users WHERE Email = @Email", conn);
            cmd.Parameters.AddWithValue("@Email", ownerEmail);

            var result = await cmd.ExecuteScalarAsync();
            if (result == null)
                return Results.BadRequest(new { message = "Kullanıcı bulunamadı." });

            ownerId = Convert.ToInt32(result);
        }

        // 3. Dosyaları al
        var coverImage = form.Files["CoverImage"];
        var roomImages = form.Files.Where(f => f.Name == "InteriorImages").ToList();

        if (coverImage == null || coverImage.Length == 0)
            return Results.BadRequest(new { message = "Kapak görseli gereklidir." });

        if (roomImages.Count != 5)
            return Results.BadRequest(new { message = "5 adet iç görsel yükleyin." });

        var wwwRootPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
        var imagesPath = Path.Combine(wwwRootPath, "images");
        Directory.CreateDirectory(imagesPath);

        // 4. Kapak görseli kaydet
        var coverFileName = Guid.NewGuid() + Path.GetExtension(coverImage.FileName);
        var coverFilePath = Path.Combine(imagesPath, coverFileName);
        await using (var stream = new FileStream(coverFilePath, FileMode.Create))
        {
            await coverImage.CopyToAsync(stream);
        }
        var coverImageUrl = $"/images/{coverFileName}";

        // 5. İç görselleri kaydet
        List<string> interiorImageUrls = new();
        foreach (var img in roomImages)
        {
            var fileName = Guid.NewGuid() + Path.GetExtension(img.FileName);
            var filePath = Path.Combine(imagesPath, fileName);
            await using var stream = new FileStream(filePath, FileMode.Create);
            await img.CopyToAsync(stream);
            interiorImageUrls.Add($"/images/{fileName}");
        }

        // 6. Veritabanına ekle
        int newHouseId;
        using (var conn = new SqlConnection(connectionString))
        {
            await conn.OpenAsync();

            var query = @"
                INSERT INTO Houses
                (Title,City, Country, Bedrooms, Bathrooms, PricePerNight, Rating, Description, CoverImageUrl, InteriorImageUrls, OwnerID)
                VALUES
                (@Title,@City, @Country, @Bedrooms, @Bathrooms, @PricePerNight, @Rating, @Description, @CoverImageUrl, @InteriorImageUrls, @OwnerID);
                SELECT CAST(SCOPE_IDENTITY() AS INT);";

            using var cmd = new SqlCommand(query, conn);
                        cmd.Parameters.AddWithValue("@Title",          title);

            cmd.Parameters.AddWithValue("@City", city);
            cmd.Parameters.AddWithValue("@Country", country);
            cmd.Parameters.AddWithValue("@Bedrooms", bedroomCount);
            cmd.Parameters.AddWithValue("@Bathrooms", bathroomCount);
            cmd.Parameters.AddWithValue("@PricePerNight", price);
            cmd.Parameters.AddWithValue("@Rating", rating);
            cmd.Parameters.AddWithValue("@Description", description ?? "");
            cmd.Parameters.AddWithValue("@CoverImageUrl", coverImageUrl);
            cmd.Parameters.AddWithValue("@InteriorImageUrls", string.Join(",", interiorImageUrls));
            cmd.Parameters.AddWithValue("@OwnerID", ownerId);

            var idResult = await cmd.ExecuteScalarAsync();
            if (idResult == null)
                return Results.BadRequest(new { message = "Ev eklendi ama ID alınamadı." });

            newHouseId = Convert.ToInt32(idResult);
        }

        // 7. Başarıyla dön
        return Results.Ok(new
        {
            message = "Ev başarıyla eklendi.",
            house = new
            {
                Id = newHouseId,
                Title=title,
                City = city,
                Country = country,
                BedroomCount = bedroomCount,
                BathroomCount = bathroomCount,
                PricePerNight = price,
                Rating = rating,
                Description = description,
                CoverImageUrl = coverImageUrl,
                InteriorImageUrls = interiorImageUrls
            }
        });
    }
    catch (Exception ex)
    {
        return Results.BadRequest(new { message = "Ev eklerken hata: " + ex.Message });
    }
});


// Login - Giriş Yapma
app.MapPost("/api/login", async (LoginRequest request, IConfiguration configuration) =>
{
    using var conn = new SqlConnection(connectionString);
    var query = "SELECT PasswordHash FROM Users WHERE Email = @Email";
    var cmd = new SqlCommand(query, conn);
    cmd.Parameters.AddWithValue("@Email", request.Email);

    try
    {
        await conn.OpenAsync();
        var result = await cmd.ExecuteScalarAsync();

        if (result != null && BCrypt.Net.BCrypt.Verify(request.Password, result.ToString()))
            return Results.Ok(new { success = true, message = "Giriş başarılı!" });

        return Results.Json(new { success = false, message = "Geçersiz e-posta ya da şifre." }, statusCode: 401);
    }
    catch (Exception ex)
    {
        return Results.Json(new { success = false, message = "Hata: " + ex.Message }, statusCode: 500);
    }
});

// Logout endpoint'i
app.MapPost("/api/logout", async (HttpContext context) =>
{
    // JWT token'ı geçersiz kılma işlemi burada yapılabilir
    // Şimdilik sadece başarılı yanıt dönüyoruz
    return Results.Ok(new { message = "Başarıyla çıkış yapıldı." });
})
.AllowAnonymous();

// ☆ BURAYA EKLENDİ: Eksik CRUD, Payment ve Review uç noktaları ☆

#region House CRUD

// GET /api/houses/all
app.MapGet("/api/houses/all", async () =>
{
    using var conn = new SqlConnection(connectionString);
    var list = await conn.QueryAsync<House>("SELECT * FROM Houses");
    return Results.Ok(list);
});

// GET /api/houses/{id}
app.MapGet("/api/houses/{id:int}", async (int id) =>
{
    try
    {
        using var conn = new SqlConnection(connectionString);
        await conn.OpenAsync();

        var house = await conn.QuerySingleOrDefaultAsync<House>(
            @"SELECT 
                h.HouseID,
                h.Title,
                h.Description,
                h.PricePerNight,
                h.HouseType,
                h.City,
                h.Country,
                h.MaxGuests,
                h.Bedrooms,
                h.Rating,
                h.CoverImageUrl,
                h.OwnerID,
                h.IsAvailable,
                h.InteriorImageUrls as Images,
                h.Features
            FROM Houses h
            WHERE h.HouseID = @Id",
            new { Id = id }
        );

        if (house == null)
        {
            return Results.NotFound(new { message = "Ev bulunamadı." });
        }

        // String'leri listeye çevir
        var response = new
        {
            house.HouseID,
            house.Title,
            house.Description,
            house.PricePerNight,
            house.HouseType,
            house.City,
            house.Country,
            house.MaxGuests,
            house.Bedrooms,
            house.Rating,
            house.CoverImageUrl,
            house.OwnerID,
            house.IsAvailable,
            Images = string.IsNullOrEmpty(house.Images) ? new List<string>() : house.Images.Split(',').ToList(),
            Features = string.IsNullOrEmpty(house.Features) ? new List<string>() : house.Features.Split(',').ToList()
        };

        return Results.Ok(response);
    }
    catch (Exception ex)
    {
        return Results.BadRequest(new { message = "Ev detayları alınırken bir hata oluştu", error = ex.Message });
    }
});

// GET /api/houses
app.MapGet("/api/houses", async ([FromQuery] bool? available = true) =>
{
    try
    {
        using var conn = new SqlConnection(connectionString);
        await conn.OpenAsync();

        var query = @"
            SELECT 
                h.HouseID,
                h.Title,
                h.Description,
                h.PricePerNight,
                h.HouseType,
                h.City,
                h.Country,
                h.MaxGuests,
                h.Bedrooms,
                h.Rating,
                h.CoverImageUrl,
                h.OwnerID,
                h.IsAvailable,
                h.InteriorImageUrls as Images,
                h.Features
            FROM Houses h
            WHERE (@Available IS NULL OR h.IsAvailable = @Available)";

        var houses = await conn.QueryAsync<House>(query, new { Available = available });

        if (houses == null || !houses.Any())
        {
            return Results.Ok(new List<object>()); // Boş liste dön
        }

        // String'leri listeye çevir
        var response = houses.Select(house => new
        {
            house.HouseID,
            house.Title,
            house.Description,
            house.PricePerNight,
            house.HouseType,
            house.City,
            house.Country,
            house.MaxGuests,
            house.Bedrooms,
            house.Rating,
            house.CoverImageUrl,
            house.OwnerID,
            house.IsAvailable,
            Images = string.IsNullOrEmpty(house.Images) ? new List<string>() : house.Images.Split(',').ToList(),
            Features = string.IsNullOrEmpty(house.Features) ? new List<string>() : house.Features.Split(',').ToList()
        }).ToList();

        return Results.Ok(response);
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Evler listelenirken hata: {ex.Message}");
        Console.WriteLine($"Stack trace: {ex.StackTrace}");
        return Results.BadRequest(new { message = "Evler listelenirken bir hata oluştu", error = ex.Message });
    }
});
#endregion

#region Reservation Yönetimi

// GET /api/reservations/{id}
app.MapGet("/api/reservations/{id:int}", async (int id) =>
{
    using var conn = new SqlConnection(connectionString);
    var res = await conn.QuerySingleOrDefaultAsync<Reservation>(
        "SELECT * FROM Reservations WHERE ReservationID = @Id",
        new { Id = id });
    return res != null
        ? Results.Ok(res)
        : Results.NotFound(new { message = "Rezervasyon bulunamadı." });
});

// GET /api/reservations?tenantId=
app.MapGet("/api/reservations", async (int tenantId) =>
{
    using var conn = new SqlConnection(connectionString);
    var list = await conn.QueryAsync<Reservation>(
        "SELECT * FROM Reservations WHERE TenantID = @TenantId",
        new { TenantId = tenantId });
    return Results.Ok(list);
});

// PUT /api/reservations/{id}/cancel
app.MapPut("/api/reservations/{id:int}/cancel", async (int id) =>
{
    using var conn = new SqlConnection(connectionString);
    var affected = await conn.ExecuteAsync(
        "UPDATE Reservations SET Status = 'Cancelled' WHERE ReservationID = @Id",
        new { Id = id });
    return affected > 0
        ? Results.Ok(new { message = "Rezervasyon iptal edildi." })
        : Results.NotFound(new { message = "Rezervasyon bulunamadı." });
});
#endregion

#region Payment Uç Noktaları

// POST /api/payments
app.MapPost("/api/payments", async (CreatePaymentDto dto) =>
{
    using var conn = new SqlConnection(connectionString);
    var sql = @"
        INSERT INTO Payments (ReservationID, Amount, PaymentMethod, Status)
        VALUES (@ReservationID, @Amount, @PaymentMethod, @Status);
        SELECT CAST(SCOPE_IDENTITY() AS INT);
    ";
    var newId = await conn.ExecuteScalarAsync<int>(sql, dto);
    return Results.Created($"/api/payments/{dto.ReservationID}", new { PaymentID = newId });
});

// GET /api/payments/{reservationId}
app.MapGet("/api/payments/{reservationId:int}", async (int reservationId) =>
{
    using var conn = new SqlConnection(connectionString);
    var pay = await conn.QuerySingleOrDefaultAsync<Payment>(
        "SELECT * FROM Payments WHERE ReservationID = @ResId",
        new { ResId = reservationId });
    return pay != null
        ? Results.Ok(pay)
        : Results.NotFound(new { message = "Ödeme bulunamadı." });
});
#endregion

#region Review Uç Noktaları

// POST /api/reviews
app.MapPost("/api/reviews", async (CreateReviewDto dto) =>
{
    using var conn = new SqlConnection(connectionString);
    var sql = @"
        INSERT INTO Reviews (ReservationID, Rating, Comment)
        VALUES (@ReservationID, @Rating, @Comment);
        SELECT CAST(SCOPE_IDENTITY() AS INT);
    ";
    var newId = await conn.ExecuteScalarAsync<int>(sql, dto);
    return Results.Created($"/api/reviews/{dto.ReservationID}", new { ReviewID = newId });
});

// GET /api/reviews?houseId=
app.MapGet("/api/reviews", async (int houseId) =>
{
    using var conn = new SqlConnection(connectionString);
    var sql = @"
        SELECT r.ReviewID, r.ReservationID, r.Rating, r.Comment
          FROM Reviews r
          JOIN Reservations res ON r.ReservationID = res.ReservationID
         WHERE res.HouseID = @HouseId
    ";
    var list = await conn.QueryAsync<Review>(sql, new { HouseId = houseId });
    return Results.Ok(list);
});

// Yorum cevabını güncelleme endpoint'i
app.MapPut("/api/reviews/{id:int}/response", async (int id, HttpRequest request) =>
{
    try
    {
        var body = await new StreamReader(request.Body).ReadToEndAsync();
        var data = System.Text.Json.JsonDocument.Parse(body);
        if (!data.RootElement.TryGetProperty("response", out var responseProp))
            return Results.BadRequest(new { message = "response alanı gerekli." });
        string response = responseProp.GetString();

        using var conn = new SqlConnection(connectionString);
        await conn.OpenAsync();
        var cmd = new SqlCommand("UPDATE Reviews SET Response = @Response WHERE ReviewID = @Id", conn);
        cmd.Parameters.AddWithValue("@Response", response);
        cmd.Parameters.AddWithValue("@Id", id);
        int affected = await cmd.ExecuteNonQueryAsync();
        return affected > 0
            ? Results.Ok(new { message = "Yorum cevabı güncellendi." })
            : Results.NotFound(new { message = "Yorum bulunamadı." });
    }
    catch (Exception ex)
    {
        return Results.BadRequest(new { message = ex.Message });
    }
});
#endregion

// Ev sahibinin rezervasyonlarını getir
app.MapGet("/api/reservations/by-owner", async (string email, IConfiguration configuration) =>
{
    using var conn = new SqlConnection(connectionString);

    // Önce ev sahibinin ID'sini bul
    var ownerId = await conn.ExecuteScalarAsync<int?>(
        "SELECT UserID FROM Users WHERE Email = @Email",
        new { Email = email }
    );
    if (ownerId == null)
        return Results.NotFound(new { message = "Ev sahibi bulunamadı." });

    // Ev sahibinin evlerine ait rezervasyonları getir
    var sql = @"
        SELECT r.*, u.Email as TenantEmail
        FROM Reservations r
        JOIN Houses h ON r.HouseID = h.HouseID
        JOIN Users u ON r.TenantID = u.UserID
        WHERE h.OwnerID = @OwnerId
        ORDER BY r.StartDate DESC";

    var reservations = await conn.QueryAsync(sql, new { OwnerId = ownerId.Value });
    return Results.Ok(reservations);
});

// Ev sahibinin yorumlarını getir
app.MapGet("/api/reviews/by-owner", async (string email, IConfiguration configuration) =>
{
    using var conn = new SqlConnection(connectionString);

    // Önce ev sahibinin ID'sini bul
    var ownerId = await conn.ExecuteScalarAsync<int?>(
        "SELECT UserID FROM Users WHERE Email = @Email",
        new { Email = email }
    );
    if (ownerId == null)
        return Results.NotFound(new { message = "Ev sahibi bulunamadı." });

    // Ev sahibinin evlerine ait yorumları getir
    var sql = @"
        SELECT r.ReviewID, r.ReservationID, r.Rating, r.Comment, u.Email as TenantEmail
        FROM Reviews r
        JOIN Reservations res ON r.ReservationID = res.ReservationID
        JOIN Houses h ON res.HouseID = h.HouseID
        JOIN Users u ON res.TenantID = u.UserID
        WHERE h.OwnerID = @OwnerId
        ORDER BY r.ReviewID DESC";

    var reviews = await conn.QueryAsync(sql, new { OwnerId = ownerId.Value });
    return Results.Ok(reviews);
});

// Ev sahibinin ödemelerini getir
app.MapGet("/api/payments/by-owner", async (string email, IConfiguration configuration) =>
{
    using var conn = new SqlConnection(connectionString);

    // Önce ev sahibinin ID'sini bul
    var ownerId = await conn.ExecuteScalarAsync<int?>(
        "SELECT UserID FROM Users WHERE Email = @Email",
        new { Email = email }
    );
    if (ownerId == null)
        return Results.NotFound(new { message = "Ev sahibi bulunamadı." });

    // Ev sahibinin evlerine ait ödemeleri getir
    var sql = @"
        SELECT p.*, r.StartDate, r.EndDate, h.Title as HouseTitle
        FROM Payments p
        JOIN Reservations r ON p.ReservationID = r.ReservationID
        JOIN Houses h ON r.HouseID = h.HouseID
        WHERE h.OwnerID = @OwnerId
        ORDER BY p.PaymentDate DESC";

    var payments = await conn.QueryAsync(sql, new { OwnerId = ownerId.Value });
    return Results.Ok(payments);
});

app.Run();


// MODELLER

public class CreatePaymentDto
{
    public int ReservationID { get; set; }
    public decimal Amount { get; set; }
    public string PaymentMethod { get; set; }
    public string Status { get; set; }
}

public class CreateReviewDto
{
    public int ReservationID { get; set; }
    public int Rating { get; set; }
    public string Comment { get; set; }
}

public class House
{
    public int HouseID { get; set; }
    public string Title { get; set; }
    public string Description { get; set; }
    public decimal PricePerNight { get; set; }
    public string HouseType { get; set; }
    public string City { get; set; }
    public string Country { get; set; }
    public int MaxGuests { get; set; }
    public int Bedrooms { get; set; }
    public double Rating { get; set; }
    public string CoverImageUrl { get; set; }
    public string Images { get; set; }
    public string Features { get; set; }
    public int OwnerID { get; set; }
    public bool IsAvailable { get; set; }
}
