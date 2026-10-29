using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;

namespace CampusMart.Models.Entities
{
    public class ApplicationUser : IdentityUser
    {
        [Required]
        public string FullName { get; set; }

        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? StudentId { get; set; }
        public string? Department { get; set; }
        public string? YearLevel { get; set; }
        public string? Section { get; set; }
        public string? Address { get; set; }
        public string? Bio { get; set; }
        public string? AvatarUrl { get; set; }

        public DateTime DateTime { get; set; } = DateTime.UtcNow;
        public ICollection<Order> Orders { get; set; }
        public Cart Cart { get; set; }
    }
}
