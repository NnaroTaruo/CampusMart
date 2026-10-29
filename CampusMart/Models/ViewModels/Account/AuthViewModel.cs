using System.ComponentModel.DataAnnotations;

namespace CampusMart.Models.ViewModels.Account
{
    public class AuthViewModel
    {
        public LoginViewModel Login { get; set; }
        public RegisterViewModel Register { get; set; }
    }
}
