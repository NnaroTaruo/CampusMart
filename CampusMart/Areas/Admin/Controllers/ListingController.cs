using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using CampusMart.Data;

namespace CampusMart.Areas.Admin.Controllers
{
    [Area("Admin")]
    [Authorize(Roles = "Admin")]
    public class ListingController : Controller
    {
        private readonly AppDbContext _db;

        public ListingController(AppDbContext db)
        {
            _db = db;
        }

        public async Task<IActionResult> Index()
        {
            var stallItems = await _db.StallItems
                .Include(i => i.Stall)
                .OrderByDescending(i => i.CreatedAt)
                .ToListAsync();

            var products = await _db.Products
                .Include(p => p.Seller)
                .Include(p => p.Category)
                .OrderByDescending(p => p.Id)
                .ToListAsync();

            ViewBag.StallItems = stallItems;
            ViewBag.Products = products;

            return View();
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Approve(int id)
        {
            var item = await _db.StallItems.FindAsync(id);
            if (item != null)
            {
                item.Status = "Approved";
                await _db.SaveChangesAsync();
            }
            return RedirectToAction(nameof(Index));
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Reject(int id)
        {
            var item = await _db.StallItems.FindAsync(id);
            if (item != null)
            {
                item.Status = "Rejected";
                await _db.SaveChangesAsync();
            }
            return RedirectToAction(nameof(Index));
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> ApproveProduct(int id)
        {
            var product = await _db.Products.FindAsync(id);
            if (product != null)
            {
                product.Status = "Approved";
                await _db.SaveChangesAsync();
            }
            return RedirectToAction(nameof(Index));
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> RejectProduct(int id)
        {
            var product = await _db.Products.FindAsync(id);
            if (product != null)
            {
                product.Status = "Rejected";
                await _db.SaveChangesAsync();
            }
            return RedirectToAction(nameof(Index));
        }
    }
}
