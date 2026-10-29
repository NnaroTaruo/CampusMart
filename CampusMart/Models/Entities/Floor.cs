using System.ComponentModel.DataAnnotations;

namespace CampusMart.Models.Entities
{
    public class Floor
    {
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; } = "";

        public int FloorNumber { get; set; }

        public int Capacity { get; set; } = 8;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<Stall> Stalls { get; set; } = new List<Stall>();
    }
}
