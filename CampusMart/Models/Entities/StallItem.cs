using System.ComponentModel.DataAnnotations;

namespace CampusMart.Models.Entities
{
    public class StallItem
    {
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; } = "";

        public decimal Price { get; set; }

        [StringLength(300)]
        public string Description { get; set; } = "";

        public string? ImageUrl { get; set; }

        public int Stock { get; set; } = 0;

        [StringLength(50)]
        public string Status { get; set; } = "Pending"; // "Pending", "Approved", "Rejected"

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // FK
        public int StallId { get; set; }
        public Stall Stall { get; set; } = null!;
    }
}
