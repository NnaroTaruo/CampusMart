namespace CampusMart.Models.ViewModels.User
{
    public class CheckoutViewModel
    {
        public List<CartItemViewModel> Items { get; set; } = new();
        public decimal Subtotal => Items.Sum(i => i.Price * i.Quantity);
        public int ItemCount => Items.Sum(i => i.Quantity);

        public string? ShippingAddress { get; set; }
        public string? PaymentMethod { get; set; }
        public string? Notes { get; set; }
    }
}
