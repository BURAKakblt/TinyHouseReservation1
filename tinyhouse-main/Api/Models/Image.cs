using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TinyHouse.Api.Models
{
    public class Image
    {
        public int Id { get; set; }
        
        [Required]
        public int HouseId { get; set; }
        
        [Required]
        public string Url { get; set; }
        
        public bool IsCover { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        [ForeignKey("HouseId")]
        public virtual House House { get; set; }
    }
} 