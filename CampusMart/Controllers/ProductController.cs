using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CampusMart.Data;
using CampusMart.Models.Entities;
using CampusMart.Models.ViewModels.User;

namespace CampusMart.Controllers
{
    [Authorize]
    public class ProductController : Controller
    {
        private readonly AppDbContext _db;
        private readonly UserManager<ApplicationUser> _userManager;

        public ProductController(AppDbContext db, UserManager<ApplicationUser> userManager)
        {
            _db = db;
            _userManager = userManager;
        }

        // Rentals page
        public IActionResult Index()
        {
            return View();
        }

        // Sell page
        [HttpGet]
        public async Task<IActionResult> Sell()
        {
            var model = new SellListingViewModel
            {
                Categories = await _db.Categories.ToListAsync()
            };
            return View(model);
        }

        [HttpPost]
        public async Task<IActionResult> Sell(SellListingViewModel model)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return RedirectToAction("Login", "Account");

            var product = new Product
            {
                Name = model.Title,
                Price = model.Price,
                CategoryId = model.CategoryId,
                Description = model.Description ?? "",
                Stock = 1,
                ImageUrl = "",
                SellerId = user.Id,
                Status = "Pending"
            };

            _db.Products.Add(product);
            await _db.SaveChangesAsync();

            return RedirectToAction("Sell");
        }

        // Product Detail page
        public async Task<IActionResult> Details(int id)
        {
            var product = await _db.Products
                .Include(p => p.Category)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (product == null) return RedirectToAction("Index", "HomeUser");

            var related = await _db.Products
                .Where(p => p.CategoryId == product.CategoryId && p.Id != product.Id)
                .Take(4)
                .ToListAsync();

            var model = new ProductDetailViewModel
            {
                Id = product.Id,
                Name = product.Name,
                Price = product.Price,
                Description = product.Description,
                ImageUrl = product.ImageUrl,
                Stock = product.Stock,
                CategoryName = product.Category?.Name,
                CategoryId = product.CategoryId,
                RelatedProducts = related.Select(r => new RelatedProductViewModel
                {
                    Id = r.Id,
                    Name = r.Name,
                    Price = r.Price,
                    ImageUrl = r.ImageUrl
                }).ToList()
            };

            return View(model);
        }
    }
}
