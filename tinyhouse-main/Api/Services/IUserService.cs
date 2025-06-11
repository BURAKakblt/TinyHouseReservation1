using System.Threading.Tasks;
using TinyHouse.Api.Models;

namespace Api.Services
{
    public interface IUserService
    {
        Task<User> GetUserByEmail(string email);
        Task<User> CreateUser(User user);
        Task<bool> UpdateUser(User user);
        Task<bool> DeleteUser(int userId);
    }
} 