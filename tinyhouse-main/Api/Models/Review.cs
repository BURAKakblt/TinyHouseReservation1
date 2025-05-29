using System;
using System.ComponentModel.DataAnnotations;
using TinyHouse.Api.Models;

namespace Api.Models
{
public class Review
{
    public int Id { get; set; }
        
        [Required]
    public int HouseId { get; set; }
        
        [Required]
        public int ReservationId { get; set; }
        
        [Required]
        public string UserEmail { get; set; }
        
        [Required]
        [Range(1, 5)]
    public int Rating { get; set; }
        
        [Required]
        public string Comment { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        public House House { get; set; }
        public Reservation Reservation { get; set; }
    }
}
