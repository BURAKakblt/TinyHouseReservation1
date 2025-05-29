// tinyhouse-main/api/Models/Reservation.cs
using System;
using System.ComponentModel.DataAnnotations;
using TinyHouse.Api.Models;

namespace Api.Models
{
public class Reservation
{
    public int Id { get; set; }
        
        [Required]
    public int HouseId { get; set; }
        
        [Required]
        public string UserEmail { get; set; }
        
        [Required]
        public DateTime CheckIn { get; set; }
        
        [Required]
        public DateTime CheckOut { get; set; }
        
        [Required]
        public int Guests { get; set; }
        
        [Required]
    public decimal TotalPrice { get; set; }
        
        [Required]
        public string Status { get; set; } // upcoming, active, completed, cancelled
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        public House House { get; set; }
        public Review Review { get; set; }
    }
}
