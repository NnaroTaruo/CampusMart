using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using CampusMart.Models.Entities;

namespace CampusMart.Areas.Admin.Controllers
{
    [Area("Admin")]
    [Authorize(Roles = "Admin")]
    public class UserManagementController : Controller
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IWebHostEnvironment _env;

        public UserManagementController(UserManager<ApplicationUser> userManager, IWebHostEnvironment env)
        {
            _userManager = userManager;
            _env = env;
        }

        public async Task<IActionResult> Index()
        {
            var admins = await _userManager.GetUsersInRoleAsync("Admin");
            var adminIds = admins.Select(a => a.Id).ToHashSet();

            var users = await _userManager.Users
                .OrderByDescending(u => u.DateTime)
                .ToListAsync();

            var students = users.Where(u => !adminIds.Contains(u.Id)).ToList();
            return View(students);
        }

        [HttpGet]
        public async Task<IActionResult> GetUserDetails(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null) return NotFound();

            return Json(new {
                user.Id,
                user.FirstName,
                user.LastName,
                user.FullName,
                user.Email,
                user.StudentId,
                user.Department,
                user.YearLevel,
                user.Section,
                user.Bio,
                user.AvatarUrl,
                DateJoined = user.DateTime.ToString("MMM dd, yyyy")
            });
        }

        [HttpPost]
        [IgnoreAntiforgeryToken]
        public async Task<IActionResult> Edit([FromForm] EditStudentDto dto)
        {
            var user = await _userManager.FindByIdAsync(dto.Id);
            if (user == null) return NotFound("User not found.");

            user.FirstName = dto.FirstName;
            user.LastName = dto.LastName;
            user.FullName = $"{dto.FirstName} {dto.LastName}";
            user.StudentId = dto.StudentId;
            user.Email = dto.Email;

            // Optional avatar update
            if (dto.AvatarFile != null && dto.AvatarFile.Length > 0)
            {
                var uploadsFolder = Path.Combine(_env.WebRootPath, "images", "avatars");
                if (!Directory.Exists(uploadsFolder))
                    Directory.CreateDirectory(uploadsFolder);

                var fileName = Guid.NewGuid() + "_" + dto.AvatarFile.FileName;
                var filePath = Path.Combine(uploadsFolder, fileName);
                using var stream = new FileStream(filePath, FileMode.Create);
                await dto.AvatarFile.CopyToAsync(stream);
                user.AvatarUrl = "/images/avatars/" + fileName;
            }

            var result = await _userManager.UpdateAsync(user);
            if (result.Succeeded) return Ok();

            return BadRequest(string.Join(", ", result.Errors.Select(e => e.Description)));
        }

        [HttpPost]
        [IgnoreAntiforgeryToken]
        public async Task<IActionResult> Delete(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null) return NotFound("User not found.");

            // Prevent deleting the main admin
            if (user.UserName == "admin" || user.Email == "admin@campusmart.local")
                return BadRequest("Cannot delete the primary administrator.");

            var result = await _userManager.DeleteAsync(user);
            if (result.Succeeded)
            {
                return Ok();
            }
            return BadRequest(string.Join(", ", result.Errors.Select(e => e.Description)));
        }

        [HttpPost]
        [IgnoreAntiforgeryToken]
        public async Task<IActionResult> Create([FromForm] CreateStudentDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.FirstName) || string.IsNullOrWhiteSpace(dto.LastName) || string.IsNullOrWhiteSpace(dto.StudentId) || string.IsNullOrWhiteSpace(dto.Email))
            {
                return BadRequest("All required fields must be filled.");
            }

            var existingUser = await _userManager.FindByNameAsync(dto.StudentId);
            if (existingUser != null)
                return BadRequest("A student with this Student ID already exists.");

            var existingEmail = await _userManager.FindByEmailAsync(dto.Email);
            if (existingEmail != null)
                return BadRequest("A student with this Email already exists.");

            string? avatarUrl = null;
            if (dto.AvatarFile != null && dto.AvatarFile.Length > 0)
            {
                var uploadsFolder = Path.Combine(_env.WebRootPath, "images", "avatars");
                if (!Directory.Exists(uploadsFolder))
                    Directory.CreateDirectory(uploadsFolder);

                var fileName = Guid.NewGuid() + "_" + dto.AvatarFile.FileName;
                var filePath = Path.Combine(uploadsFolder, fileName);
                using var stream = new FileStream(filePath, FileMode.Create);
                await dto.AvatarFile.CopyToAsync(stream);
                avatarUrl = "/images/avatars/" + fileName;
            }

            var newUser = new ApplicationUser
            {
                UserName = dto.StudentId, 
                Email = dto.Email,
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                FullName = $"{dto.FirstName} {dto.LastName}",
                StudentId = dto.StudentId,
                AvatarUrl = avatarUrl,
                DateTime = DateTime.UtcNow
            };

            var result = await _userManager.CreateAsync(newUser, "CampusMart123!");
            if (result.Succeeded)
            {
                return Ok();
            }
            
            return BadRequest(string.Join(", ", result.Errors.Select(e => e.Description)));
        }
    }

    public class CreateStudentDto
    {
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? StudentId { get; set; }
        public string? Email { get; set; }
        public IFormFile? AvatarFile { get; set; }
    }

    public class EditStudentDto
    {
        public string Id { get; set; } = string.Empty;
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? StudentId { get; set; }
        public string? Email { get; set; }
        public IFormFile? AvatarFile { get; set; }
    }
}
