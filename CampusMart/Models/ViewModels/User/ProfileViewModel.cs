using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace CampusMart.Models.ViewModels.User
{
    public class ProfileViewModel
    {
        [Required(ErrorMessage = "First name is required")]
        public string? FirstName { get; set; }

        [Required(ErrorMessage = "Last name is required")]
        public string? LastName { get; set; }
        
        public string? StudentId { get; set; }
        public string? Department { get; set; }
        public string? Email { get; set; }

        public string? Phone { get; set; }

        public string? Address { get; set; }

        [StringLength(200)]
        public string? Bio { get; set; }
        
        public string? AvatarUrl { get; set; }
        public string? YearLevel { get; set; }

        public string? Section { get; set; }

        public IFormFile? AvatarFile { get; set; }
    }
}
