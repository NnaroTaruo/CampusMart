using CampusMart.Models.Entities;

namespace CampusMart.Models.ViewModels.User
{
    public class ProductListViewModel
    {
        public List<Product> Products { get; set; } = new();
        public List<Category> Categories { get; set; } = new();
        public int? ActiveCategoryId { get; set; }
    }
}
