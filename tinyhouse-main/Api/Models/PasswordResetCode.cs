using System;

namespace TinyHouse.Api.Models
{
    public class PasswordResetCode
    {
        public string Email { get; set; }
        public string Code { get; set; }
        public DateTime Expiry { get; set; }
    }
} 