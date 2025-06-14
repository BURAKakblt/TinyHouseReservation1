using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TinyHouse.Api.Models
{
    public class Review
    {
        public int Id { get; set; }
        
        [Required]
        public int HouseId { get; set; }
        
        [Required]
        public int UserId { get; set; }
        
        [Required]
        [Range(1, 5)]
        public int Rating { get; set; }
        
        [Required]
        public string Comment { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        [ForeignKey("HouseId")]
        public virtual House House { get; set; }
        
        [ForeignKey("UserId")]
        public virtual User User { get; set; }
    }
}
