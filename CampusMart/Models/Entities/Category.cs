using System.ComponentModel.DataAnnotations;

namespace CampusMart.Models.Entities
{
    public class Category
    {

        [Required]
        public int Id { get; set; }


        [Required]
        [StringLength(100, MinimumLength = 10)]
        public string Name { get; set; }

        public string Descscription { get; set; }

        public ICollection<Product> Products { get; set; } 

    }
}
