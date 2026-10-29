namespace CampusMart.Models.ViewModels.User
{
    public class ProductDetailViewModel
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public decimal Price { get; set; }
        public string? Description { get; set; }
        public string? ImageUrl { get; set; }
        public int Stock { get; set; }
        public string? CategoryName { get; set; }
        public int CategoryId { get; set; }

        // Related products from same category
        public List<RelatedProductViewModel> RelatedProducts { get; set; } = new();
    }

    public class RelatedProductViewModel
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public decimal Price { get; set; }
        public string? ImageUrl { get; set; }
    }
}
