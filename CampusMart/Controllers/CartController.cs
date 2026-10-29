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
    public class CartController : Controller
    {
        private readonly AppDbContext _db;
        private readonly UserManager<ApplicationUser> _userManager;

        public CartController(AppDbContext db, UserManager<ApplicationUser> userManager)
        {
            _db = db;
            _userManager = userManager;
        }

        public async Task<IActionResult> Index()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return RedirectToAction("Login", "Account");

            var cart = await _db.Carts
                .Include(c => c.CartItems)
                    .ThenInclude(ci => ci.Product)
                        .ThenInclude(p => p.Category)
                .Include(c => c.CartItems)
                    .ThenInclude(ci => ci.StallItem)
                .FirstOrDefaultAsync(c => c.UserId == user.Id);

            var model = new CartViewModel();
            if (cart != null && cart.CartItems != null)
            {
                model.Items = cart.CartItems.Select(ci => new CartItemViewModel
                {
                    CartItemId = ci.Id,
                    ProductId = ci.ProductId,
                    StallItemId = ci.StallItemId,
                    ProductName = ci.Product?.Name ?? ci.StallItem?.Name ?? "Unknown",
                    ImageUrl = ci.Product?.ImageUrl ?? ci.StallItem?.ImageUrl,
                    Price = ci.Product?.Price ?? ci.StallItem?.Price ?? 0,
                    Quantity = ci.Quantity,
                    CategoryName = ci.Product?.Category?.Name ?? "Stall Item"
                }).ToList();
            }

            return View(model);
        }

        [HttpPost]
        public async Task<IActionResult> AddToCart(int? productId, int? stallItemId, int quantity = 1)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return RedirectToAction("Login", "Account");

            if (productId == null && stallItemId == null)
            {
                TempData["Error"] = "Item not found.";
                return RedirectToAction("Index", "UserDashboard");
            }

            if (productId.HasValue)
            {
                var product = await _db.Products.FindAsync(productId);
                if (product == null)
                {
                    TempData["Error"] = "Product not found.";
                    return RedirectToAction("Index", "UserDashboard");
                }
                if (product.Stock < quantity)
                {
                    TempData["Error"] = "Insufficient stock for this product.";
                    return RedirectToAction("Index", "UserDashboard");
                }
            }

            if (stallItemId.HasValue)
            {
                var stallItem = await _db.StallItems.FindAsync(stallItemId);
                if (stallItem == null)
                {
                    TempData["Error"] = "Stall item not found.";
                    return RedirectToAction("Index", "UserDashboard");
                }
                if (stallItem.Stock < quantity)
                {
                    TempData["Error"] = "Insufficient stock for this stall item.";
                    return RedirectToAction("Index", "Stall", new { id = stallItem.StallId });
                }
            }

            var cart = await _db.Carts.Include(c => c.CartItems)
                .FirstOrDefaultAsync(c => c.UserId == user.Id);

            if (cart == null)
            {
                cart = new Cart { UserId = user.Id, CartItems = new List<CartItem>() };
                _db.Carts.Add(cart);
                await _db.SaveChangesAsync();
            }

            var existing = cart.CartItems?.FirstOrDefault(ci => 
                (productId.HasValue && ci.ProductId == productId) || 
                (stallItemId.HasValue && ci.StallItemId == stallItemId));

            if (existing != null)
            {
                existing.Quantity += quantity;
            }
            else
            {
                _db.CartItems.Add(new CartItem { CartId = cart.Id, ProductId = productId, StallItemId = stallItemId, Quantity = quantity });
            }

            await _db.SaveChangesAsync();
            TempData["SuccessMessage"] = "Item added to cart successfully!";
            TempData["OpenCart"] = true;
            return Redirect(Request.Headers["Referer"].ToString() ?? "/");
        }

        [HttpPost]
        public async Task<IActionResult> RemoveFromCart(int cartItemId)
        {
            var item = await _db.CartItems.FindAsync(cartItemId);
            if (item != null)
            {
                _db.CartItems.Remove(item);
                await _db.SaveChangesAsync();
            }
            return RedirectToAction("Index");
        }
    }
}
