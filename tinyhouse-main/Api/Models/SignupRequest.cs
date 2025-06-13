namespace TinyHouse.Api.Models;

public class SignupRequest
{
    public string Username { get; set; }
    public string Email    { get; set; }
    public string Password { get; set; }
    public int    RoleID   { get; set; }  // 1=Admin, 2=Owner, 3=Tenant
    public string? Role { get; set; } // 'tenant', 'owner', 'admin' gibi string roller için
    public string? LastName { get; set; }
}
