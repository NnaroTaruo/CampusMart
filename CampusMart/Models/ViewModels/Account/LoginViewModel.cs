using System.ComponentModel.DataAnnotations;

namespace CampusMart.Models.ViewModels.Account
{
    public class LoginViewModel
    {
        [Required]
        [Display(Name = "Student ID Number")]
        public string StudentId { get; set; }

        [Required]
        [DataType(DataType.Password)]
        public string Password { get; set; }

        [Required]
        [Display(Name = "Remember Me")]
        public bool RememberMe { get; set; }
    }
}
