using CampusMart.Models.Entities;

namespace CampusMart.Models.ViewModels.User
{
    public class CartViewModel
    {
        public List<CartItemViewModel> Items { get; set; } = new();
        public decimal Subtotal => Items.Sum(i => i.Price * i.Quantity);
        public int ItemCount => Items.Sum(i => i.Quantity);
    }

    public class CartItemViewModel
    {
        public int CartItemId { get; set; }
        public int? ProductId { get; set; }
        public int? StallItemId { get; set; }
        public string ProductName { get; set; }
        public string? ImageUrl { get; set; }
        public decimal Price { get; set; }
        public int Quantity { get; set; }
        public string? CategoryName { get; set; }
    }
}
