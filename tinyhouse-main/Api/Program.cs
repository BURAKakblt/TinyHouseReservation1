using Microsoft.Extensions.Configuration;
using Microsoft.Data.SqlClient;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;
using BCrypt.Net;

var builder = WebApplication.CreateBuilder(args);

// CORS ayarları
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.WithOrigins("http://localhost:3000") // Frontend adresin
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

app.UseCors("AllowAll");
app.UseStaticFiles();

// Signup - Kayıt Olma
app.MapPost("/api/signup", async (User user, IConfiguration configuration) =>
{
    var connectionString = configuration.GetConnectionString("DefaultConnection");
    Console.WriteLine("Bağlantı: " + connectionString);
    Console.WriteLine($"Kullanıcı adı: {user.Username}, Email: {user.Email}");

    using var conn = new SqlConnection(connectionString);
    var query = "INSERT INTO Users (Username, Email, PasswordHash) VALUES (@Username, @Email, @PasswordHash)";
    var cmd = new SqlCommand(query, conn);
    cmd.Parameters.AddWithValue("@Username", user.Username);
    cmd.Parameters.AddWithValue("@Email", user.Email);

    string hashedPassword = BCrypt.Net.BCrypt.HashPassword(user.Password ?? "");
    cmd.Parameters.AddWithValue("@PasswordHash", hashedPassword);

    try
    {
        await conn.OpenAsync();
        int rowsAffected = await cmd.ExecuteNonQueryAsync();
        Console.WriteLine("Eklenen satır sayısı: " + rowsAffected);

        return Results.Ok(new { message = "Kayıt başarılı!" });
    }
    catch (SqlException ex)
    {
        Console.WriteLine("HATA: " + ex.Message);
        return Results.BadRequest(new { message = "Kayıt başarısız: " + ex.Message });
    }
});


// Evleri ID'ye göre silme
app.MapDelete("/api/houses/{id:int}", async (int id, IConfiguration configuration) =>
{
    var connectionString = configuration.GetConnectionString("DefaultConnection");
    using var conn = new SqlConnection(connectionString);
    await conn.OpenAsync();

    var cmd = new SqlCommand("DELETE FROM Houses WHERE Id = @Id", conn);
    cmd.Parameters.AddWithValue("@Id", id);

    int affected = await cmd.ExecuteNonQueryAsync();
    return affected == 0 
        ? Results.NotFound(new { message = "Ev bulunamadı." }) 
        : Results.Ok(new { message = "Ev başarıyla silindi." });
});

// Ev güncelleme (PUT)
app.MapPut("/api/houses/{id:int}", async (HttpRequest request, int id, IConfiguration configuration) =>
{
    var form = await request.ReadFormAsync();

    string city = form["City"];
    string country = form["Country"];
    string description = form["Description"];
    int bedroomCount = int.Parse(form["BedroomCount"]);
    int bathroomCount = int.Parse(form["BathroomCount"]);
    decimal price = decimal.Parse(form["PricePerNight"]);
    decimal rating = decimal.Parse(form["Rating"]);

    var connectionString = configuration.GetConnectionString("DefaultConnection");
    using var conn = new SqlConnection(connectionString);
    await conn.OpenAsync();

    var query = @"
        UPDATE Houses SET
            City = @City, Country = @Country, BedroomCount = @BedroomCount,
            BathroomCount = @BathroomCount, PricePerNight = @PricePerNight,
            Rating = @Rating, Description = @Description
        WHERE Id = @Id";

    var cmd = new SqlCommand(query, conn);
    cmd.Parameters.AddWithValue("@City", city);
    cmd.Parameters.AddWithValue("@Country", country);
    cmd.Parameters.AddWithValue("@BedroomCount", bedroomCount);
    cmd.Parameters.AddWithValue("@BathroomCount", bathroomCount);
    cmd.Parameters.AddWithValue("@PricePerNight", price);
    cmd.Parameters.AddWithValue("@Rating", rating);
    cmd.Parameters.AddWithValue("@Description", description);
    cmd.Parameters.AddWithValue("@Id", id);

    int affected = await cmd.ExecuteNonQueryAsync();
    return affected == 0 
        ? Results.NotFound(new { message = "Ev bulunamadı." }) 
        : Results.Ok(new { message = "Ev başarıyla güncellendi." });
});

// Evleri email'e göre listeleme
app.MapGet("/api/houses", async (HttpRequest request, IConfiguration configuration) =>
{
    var email = request.Query["email"].ToString();
    if (string.IsNullOrWhiteSpace(email))
        return Results.BadRequest(new { message = "Email parametresi zorunludur." });

    var connectionString = configuration.GetConnectionString("DefaultConnection");
    var houseList = new List<object>();

    using var conn = new SqlConnection(connectionString);
    await conn.OpenAsync();

    var userCmd = new SqlCommand("SELECT Id FROM Users WHERE Email = @Email", conn);
    userCmd.Parameters.AddWithValue("@Email", email);
    var userIdObj = await userCmd.ExecuteScalarAsync();

    if (userIdObj == null)
        return Results.BadRequest(new { message = "Kullanıcı bulunamadı." });

    int userId = Convert.ToInt32(userIdObj);

    var query = "SELECT * FROM Houses WHERE OwnerId = @OwnerId";
    var cmd = new SqlCommand(query, conn);
    cmd.Parameters.AddWithValue("@OwnerId", userId);
    var reader = await cmd.ExecuteReaderAsync();

    while (await reader.ReadAsync())
    {
        houseList.Add(new
        {
            Id = Convert.ToInt32(reader["Id"]),
            City = reader["City"].ToString(),
            Country = reader["Country"].ToString(),
            BedroomCount = Convert.ToInt32(reader["BedroomCount"]),
            BathroomCount = Convert.ToInt32(reader["BathroomCount"]),
            PricePerNight = Convert.ToDecimal(reader["PricePerNight"]),
            Rating = Convert.ToDecimal(reader["Rating"]),
            Description = reader["Description"].ToString(),
            CoverImageUrl = reader["ImagePath"].ToString(),
            InteriorImageUrls = reader["RoomImagePaths"].ToString()
                .Split(',', StringSplitOptions.RemoveEmptyEntries)
                .Select(url => url.Trim())
                .ToList()
        });
    }

    return Results.Ok(houseList);
});
// Ev Ekleme
app.MapPost("/api/houses", async (HttpRequest request, IConfiguration configuration) =>
{
    var form = await request.ReadFormAsync();

    // 1. Form verileri
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

    // 2. Kullanıcıyı bul
    var connectionString = configuration.GetConnectionString("DefaultConnection");
    int ownerId;

    using (var conn = new SqlConnection(connectionString))
    {
        await conn.OpenAsync();
        var cmd = new SqlCommand("SELECT Id FROM Users WHERE Email = @Email", conn);
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
            (City, Country, BedroomCount, BathroomCount, PricePerNight, Rating, Description, ImagePath, RoomImagePaths, OwnerId)
            VALUES
            (@City, @Country, @BedroomCount, @BathroomCount, @PricePerNight, @Rating, @Description, @ImagePath, @RoomImagePaths, @OwnerId);
            SELECT CAST(SCOPE_IDENTITY() AS INT);";

        using var cmd = new SqlCommand(query, conn);
        cmd.Parameters.AddWithValue("@City", city);
        cmd.Parameters.AddWithValue("@Country", country);
        cmd.Parameters.AddWithValue("@BedroomCount", bedroomCount);
        cmd.Parameters.AddWithValue("@BathroomCount", bathroomCount);
        cmd.Parameters.AddWithValue("@PricePerNight", price);
        cmd.Parameters.AddWithValue("@Rating", rating);
        cmd.Parameters.AddWithValue("@Description", description ?? "");
        cmd.Parameters.AddWithValue("@ImagePath", coverImageUrl);
        cmd.Parameters.AddWithValue("@RoomImagePaths", string.Join(",", interiorImageUrls));
        cmd.Parameters.AddWithValue("@OwnerId", ownerId);

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
});


// Login - Giriş Yapma
app.MapPost("/api/login", async (LoginRequest request, IConfiguration configuration) =>
{
    var connectionString = configuration.GetConnectionString("DefaultConnection");

    using var conn = new SqlConnection(connectionString);
    var query = "SELECT PasswordHash FROM Users WHERE Email = @Email";
    var cmd = new SqlCommand(query, conn);
    cmd.Parameters.AddWithValue("@Email", request.Email);

    try
    {
        await conn.OpenAsync();
        var result = await cmd.ExecuteScalarAsync();

        if (result != null)
        {
            var storedPasswordHash = result.ToString();
            var isPasswordValid = BCrypt.Net.BCrypt.Verify(request.Password, storedPasswordHash);

            if (isPasswordValid)
            {
                return Results.Ok(new { success = true, message = "Giriş başarılı!" }); // <--- DİKKAT
            }
            else
            {
                return Results.Json(new { success = false, message = "Geçersiz e-posta ya da şifre." }, statusCode: 401);
            }
        }
        else
        {
            return Results.Json(new { success = false, message = "Kullanıcı bulunamadı." }, statusCode: 404);
        }
    }
    catch (SqlException ex)
    {
        return Results.Json(new { success = false, message = "Hata: " + ex.Message }, statusCode: 500);
    }
    catch (Exception ex)
    {
        return Results.Json(new { success = false, message = "Beklenmeyen hata: " + ex.Message }, statusCode: 500); // <--- DİKKAT
    }
});

app.Run();

// MODELLER
public class User
{
    public string Username { get; set; }
    public string Email { get; set; }
    public string Password { get; set; } // Ham şifre
}

public class LoginRequest
{
    public string Email { get; set; }
    public string Password { get; set; } // Ham şifre
}

public class House
{
    public string City { get; set; }
    public string Country { get; set; }
    public int BedroomCount { get; set; }
    public int BathroomCount { get; set; }
    public decimal PricePerNight { get; set; }
    public decimal Rating { get; set; }
    public IFormFile Image { get; set; }
    public List<IFormFile> RoomImages { get; set; } // Oda görselleri
  
  public string Description { get; set; }
}


