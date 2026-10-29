using System.ComponentModel.DataAnnotations;

namespace CampusMart.Models.ViewModels.User
{
    public class SellListingViewModel
    {
        [Required]
        [StringLength(100, MinimumLength = 5)]
        public string Title { get; set; }

        [Required]
        public decimal Price { get; set; }

        [Required]
        public int CategoryId { get; set; }

        [Required]
        public string Condition { get; set; }

        public string? Description { get; set; }

        public List<Entities.Category>? Categories { get; set; }
        public List<Entities.Product>? MyListings { get; set; }
    }
}
