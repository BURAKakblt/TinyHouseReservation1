using Microsoft.EntityFrameworkCore;
using TinyHouse.Api.Models;

namespace TinyHouse.Api.Data
{
    public class HouseContext : DbContext
    {
        public HouseContext(DbContextOptions<HouseContext> options) : base(options)
        {
        }

        public DbSet<House> Houses { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<House>()
                .HasKey(h => h.HouseID);
        }
    }
} 