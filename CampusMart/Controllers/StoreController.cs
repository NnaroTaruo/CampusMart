using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CampusMart.Data;

namespace CampusMart.Controllers
{
    [AllowAnonymous]
    public class StoreController : Controller
    {
        private readonly AppDbContext _db;

        public StoreController(AppDbContext db)
        {
            _db = db;
        }

        public async Task<IActionResult> Index(string category = null)
        {
            var productsQuery = _db.Products.Include(p => p.Category).AsQueryable();

            if (!string.IsNullOrEmpty(category))
            {
                productsQuery = productsQuery.Where(p => p.Category.Name == category);
            }

            var products = await productsQuery.ToListAsync();
            var categories = await _db.Categories.ToListAsync();

            ViewBag.SelectedCategory = category;
            ViewBag.Categories = categories;

            return View(products);
        }
    }
}
