using TinyHouse.Api.Models;

namespace Api.Services
{
    public interface IUserService
    {
        Task<User> GetUserByEmail(string email);
    }
} 