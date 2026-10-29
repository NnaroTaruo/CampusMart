using System.ComponentModel.DataAnnotations;

namespace CampusMart.Models.Entities
{
    public class CartItem
    {
        public int Id { get; set; }

        public int CartId { get; set; }
        public Cart Cart { get; set; }

        public int? ProductId { get; set; }
        public Product? Product { get; set; }

        public int? StallItemId { get; set; }
        public StallItem? StallItem { get; set; }

        [Required]
        public int Quantity { get; set; }
    }
}
