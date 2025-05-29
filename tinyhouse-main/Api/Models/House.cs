// Models/House.cs
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Api.Models;

namespace Api.Models;

public class House
{
    public int Id { get; set; }
    
    [Required]
    public string Title { get; set; }
    
    [Required]
    public string Description { get; set; }
    
    [Required]
    public string Location { get; set; }
    
    [Required]
    public decimal Price { get; set; }
    
    [Required]
    public string OwnerEmail { get; set; }
    
    public List<string> Images { get; set; } = new List<string>();
    
    public List<string> Amenities { get; set; } = new List<string>();
    
    public double Rating { get; set; }
    
    public int ReviewCount { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public List<Reservation> Reservations { get; set; } = new List<Reservation>();
    public List<Review> Reviews { get; set; } = new List<Review>();
}
