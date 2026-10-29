using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authorization;
using CampusMart.Models.ViewModels.Account;
using CampusMart.Models.Entities;

namespace CampusMart.Controllers
{
    public class AccountController : Controller
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;

        public AccountController(
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager)
        {
            _userManager = userManager;
            _signInManager = signInManager;
        }

        [HttpGet]
        public async Task<IActionResult> Login()
        {
            if (User.Identity.IsAuthenticated)
            {
                // If the user is an admin, send them to the admin dashboard.
                var user = await _userManager.GetUserAsync(User);
                if (user != null && await _userManager.IsInRoleAsync(user, "Admin"))
                    return RedirectToAction("Index", "Dashboard", new { area = "Admin" });

                return RedirectToAction("Index", "UserDashboard");
            }

            return View(new LoginViewModel());
        }

        [HttpPost]
        public async Task<IActionResult> Login(LoginViewModel model)
        {
            if (!ModelState.IsValid)
            {
                TempData["ErrorMessage"] = "Please provide valid credentials.";
                return View(model);
            }

            // Find user by StudentId (stored as UserName)
            var user = await _userManager.FindByNameAsync(model.StudentId);
            if (user == null)
            {
                TempData["ErrorMessage"] = "Invalid Student ID or Password.";
                ModelState.AddModelError("", "Invalid Student ID or Password.");
                return View(model);
            }

            var result = await _signInManager.PasswordSignInAsync(user, model.Password, model.RememberMe, false);
            if (result.Succeeded)
            {
                TempData["SuccessMessage"] = "Successfully logged in. Welcome back!";
                if (await _userManager.IsInRoleAsync(user, "Admin"))
                    return RedirectToAction("Index", "Dashboard", new { area = "Admin" });

                return RedirectToAction("Index", "UserDashboard");
            }

            TempData["ErrorMessage"] = "Invalid Student ID or Password.";
            ModelState.AddModelError("", "Invalid Student ID or Password.");
            return View(model);
        }

        [HttpGet]
        public IActionResult ForgotPassword()
        {
            return View();
        }

        [HttpPost]
        public IActionResult ForgotPassword(string studentId)
        {
            if (string.IsNullOrEmpty(studentId))
            {
                ModelState.AddModelError("", "Please enter your Student ID.");
                return View();
            }

            // In a real application, you would generate a reset token and send an email.
            // For now, we will simulate a successful password reset email sent.
            TempData["SuccessMessage"] = "If an account with that Student ID exists, a password reset link has been sent to the registered email address.";
            return RedirectToAction("Login");
        }

        [HttpGet]
        public async Task<IActionResult> Register()
        {
            if (User.Identity.IsAuthenticated)
            {
                var user = await _userManager.GetUserAsync(User);
                if (user != null && await _userManager.IsInRoleAsync(user, "Admin"))
                    return RedirectToAction("Index", "Dashboard", new { area = "Admin" });

                return RedirectToAction("Index", "UserDashboard");
            }

            return View(new RegisterViewModel());
        }

        [HttpPost]
        public async Task<IActionResult> Register(RegisterViewModel model)
        {
            if (!ModelState.IsValid)
            {
                TempData["ErrorMessage"] = "Please fill in all required fields correctly.";
                return View(model);
            }

            var user = new ApplicationUser
            {
                UserName = model.StudentId,
                Email = model.Email,
                FullName = $"{model.FirstName} {model.LastName}",
                FirstName = model.FirstName,
                LastName = model.LastName,
                StudentId = model.StudentId,
                Department = model.Department,
                DateTime = DateTime.UtcNow
            };

            var result = await _userManager.CreateAsync(user, model.Password);
            if (result.Succeeded)
            {
                TempData["SuccessMessage"] = "Account successfully created! Please login to continue.";
                return RedirectToAction("Login", "Account");
            }

            TempData["ErrorMessage"] = "Registration failed. Please check the errors.";
            foreach (var error in result.Errors)
            {
                ModelState.AddModelError("", error.Description);
            }

            return View(model);
        }

        [HttpPost]
        public async Task<IActionResult> Logout()
        {
            await _signInManager.SignOutAsync();
            TempData["SuccessMessage"] = "You have been logged out successfully.";
            return RedirectToAction("HomeIndex", "Home");
        }
    }
}
