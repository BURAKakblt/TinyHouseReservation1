// Models/House.cs
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Api.Models;

namespace TinyHouse.Api.Models
{
    public class House
    {
        public int HouseID { get; set; }
        public int OwnerID { get; set; }
        public string Title { get; set; } = "";
        public string Description { get; set; } = "";
        public string City { get; set; } = "";
        public string Country { get; set; } = "";
        public int Bedrooms { get; set; }
        public int Bathrooms { get; set; }
        public decimal PricePerNight { get; set; }
        public string CoverImageUrl { get; set; } = "";
        public int TotalReservations { get; set; }
        public double Rating { get; set; }
        public string InteriorImageUrl { get; set; } = "";
        public bool? IsAvailable { get; set; }
        public string HouseType { get; set; } = "";
        public int? MaxGuests { get; set; }
        public string Features { get; set; } = "";
        public string Location { get; set; } = "";
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}