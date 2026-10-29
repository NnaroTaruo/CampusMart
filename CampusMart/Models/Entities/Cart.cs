namespace CampusMart.Models.Entities
{
    public class Cart
    {

        public int Id { get; set; }

        public string UserId { get; set; }
        public ApplicationUser User { get; set; }

        public ICollection<CartItem> CartItems { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
