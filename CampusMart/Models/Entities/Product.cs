using System.ComponentModel.DataAnnotations;

namespace CampusMart.Models.Entities
{
    public class Product
    {
        public int Id { get; set; }

        [Required]
        [StringLength(100, MinimumLength = 10)]
        public string Name { get; set; }

        [Required]
        public decimal Price { get; set; } = decimal.Zero;

        [Required]
        public int Stock { get; set; } = 0;

        public string Description { get; set; }

        public string ImageUrl { get; set; }

        public int CategoryId { get; set; }
        public Category Category { get; set; }

        public string Status { get; set; } = "Pending"; // "Pending", "Approved", "Rejected"
        
        public string? SellerId { get; set; }
        public ApplicationUser? Seller { get; set; }

        public ICollection<OrderItem> OrderItems { get; set; }
        public ICollection<CartItem> CartItems { get; set; }

    }
}
