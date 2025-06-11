using System;
using System.Threading.Tasks;
using System.Data;
using TinyHouse.Api.Data;
using TinyHouse.Api.Models;

namespace Api.Services
{
    public class UserService : IUserService
    {
        private readonly DatabaseHelper _db;

        public UserService(DatabaseHelper db)
        {
            _db = db;
        }

        public async Task<User?> GetUserByEmail(string email)
        {
            var query = "SELECT TOP 1 * FROM Users WHERE Email = @Email";
            var parameters = new Dictionary<string, object> { { "@Email", email } };
            var table = await _db.ExecuteQueryAsync(query, parameters);

            if (table.Rows.Count == 0)
                return null;

            var row = table.Rows[0];
            return new User
            {
                UserID = Convert.ToInt32(row["UserID"]),
                Email = row["Email"].ToString() ?? "",
                PasswordHash = row["PasswordHash"].ToString() ?? "",
                FirstName = row["FirstName"].ToString() ?? "",
                LastName = row["LastName"].ToString() ?? "",
                Role = row["Role"].ToString() ?? ""
            };
        }

        public async Task<User> CreateUser(User user)
        {
            var query = @"INSERT INTO Users (Email, PasswordHash, FirstName, LastName, Role) 
                            OUTPUT INSERTED.UserID 
                            VALUES (@Email, @PasswordHash, @FirstName, @LastName, @Role)";
            var parameters = new Dictionary<string, object>
            {
                {"@Email", user.Email},
                {"@PasswordHash", user.PasswordHash},
                {"@FirstName", user.FirstName},
                {"@LastName", user.LastName},
                {"@Role", user.Role}
            };
            var userId = await _db.ExecuteScalarAsync(query, parameters);
            user.UserID = Convert.ToInt32(userId);
            return user;
        }

        public async Task<bool> UpdateUser(User user)
        {
            var query = @"UPDATE Users SET Email=@Email, PasswordHash=@PasswordHash, FirstName=@FirstName, LastName=@LastName, Role=@Role WHERE UserID=@UserID";
            var parameters = new Dictionary<string, object>
            {
                {"@UserID", user.UserID},
                {"@Email", user.Email},
                {"@PasswordHash", user.PasswordHash},
                {"@FirstName", user.FirstName},
                {"@LastName", user.LastName},
                {"@Role", user.Role}
            };
            var affected = await _db.ExecuteNonQueryAsync(query, parameters);
            return affected > 0;
        }

        public async Task<bool> DeleteUser(int userId)
        {
            var query = "DELETE FROM Users WHERE UserID=@UserID";
            var parameters = new Dictionary<string, object> { {"@UserID", userId} };
            var affected = await _db.ExecuteNonQueryAsync(query, parameters);
            return affected > 0;
        }
    }
} 