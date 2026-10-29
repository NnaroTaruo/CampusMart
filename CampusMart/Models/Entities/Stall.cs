using System.ComponentModel.DataAnnotations;

namespace CampusMart.Models.Entities
{
    public class Stall
    {
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; } = "";

        [StringLength(50)]
        public string StallNumber { get; set; } = "";

        [StringLength(100)]
        public string OwnerName { get; set; } = "";

        [StringLength(50)]
        public string Category { get; set; } = "";

        [StringLength(500)]
        public string Description { get; set; } = "";

        public string? ImageUrl { get; set; }

        /// <summary>Opening time, e.g. "08:00"</summary>
        [StringLength(10)]
        public string OpenTime { get; set; } = "08:00";

        /// <summary>Closing time, e.g. "20:00"</summary>
        [StringLength(10)]
        public string CloseTime { get; set; } = "20:00";

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // FK
        public int FloorId { get; set; }
        public Floor Floor { get; set; } = null!;

        // Navigation: items sold at this stall
        public ICollection<StallItem> StallItems { get; set; } = new List<StallItem>();
    }
}
