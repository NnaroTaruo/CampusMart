using System.ComponentModel.DataAnnotations;

namespace CampusMart.Models.Entities
{
    public class OrderItem
    {

        public int Id { get; set; }

        public int OrderId { get; set; }
        public Order Order { get; set; }

        public int? ProductId { get; set; }
        public Product? Product { get; set; }

        public int? StallItemId { get; set; }
        public StallItem? StallItem { get; set; }

        [Required]
        public int Quantity { get; set; }

        [Required]
        public decimal Price { get; set; }
    }
}
