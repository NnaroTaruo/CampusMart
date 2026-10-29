using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CampusMart.Data;
using CampusMart.Models.Entities;
using CampusMart.Models.ViewModels.User;

namespace CampusMart.ViewComponents
{
    public class CartSidebarViewComponent : ViewComponent
    {
        private readonly AppDbContext _db;
        private readonly UserManager<ApplicationUser> _userManager;

        public CartSidebarViewComponent(AppDbContext db, UserManager<ApplicationUser> userManager)
        {
            _db = db;
            _userManager = userManager;
        }

        public async Task<IViewComponentResult> InvokeAsync()
        {
            var user = await _userManager.GetUserAsync(HttpContext.User);
            if (user == null)
            {
                return View(new CartViewModel());
            }

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
    }
}
