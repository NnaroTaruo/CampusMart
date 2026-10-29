namespace CampusMart.Models.ViewModels.User
{
    public class OrderHistoryViewModel
    {
        public List<OrderSummaryViewModel> Orders { get; set; } = new();
    }

    public class OrderSummaryViewModel
    {
        public int OrderId { get; set; }
        public DateTime CreatedAt { get; set; }
        public string Status { get; set; }
        public decimal TotalAmount { get; set; }
        public string? PaymentMethod { get; set; }
        public string? ShippingAddress { get; set; }
        public int ItemCount { get; set; }
        public List<OrderItemDetailViewModel> Items { get; set; } = new();
    }

    public class OrderItemDetailViewModel
    {
        public string ProductName { get; set; }
        public string? ImageUrl { get; set; }
        public decimal Price { get; set; }
        public int Quantity { get; set; }
    }
}
