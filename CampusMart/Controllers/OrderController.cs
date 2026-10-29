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
    public class OrderController : Controller
    {
        private readonly AppDbContext _db;
        private readonly UserManager<ApplicationUser> _userManager;

        public OrderController(AppDbContext db, UserManager<ApplicationUser> userManager)
        {
            _db = db;
            _userManager = userManager;
        }

        // Order History
        public async Task<IActionResult> Index()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return RedirectToAction("Login", "Account");

            var orders = await _db.Orders
                .Where(o => o.UserId == user.Id)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Product)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.StallItem)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();

            var model = new OrderHistoryViewModel
            {
                Orders = orders.Select(o => new OrderSummaryViewModel
                {
                    OrderId = o.Id,
                    CreatedAt = o.CreatedAt,
                    Status = o.Status,
                    TotalAmount = o.TotalAmount,
                    PaymentMethod = o.PaymentMethod,
                    ShippingAddress = o.ShippingAddress,
                    ItemCount = o.OrderItems?.Sum(oi => oi.Quantity) ?? 0,
                    Items = o.OrderItems?.Select(oi => new OrderItemDetailViewModel
                    {
                        ProductName = oi.Product?.Name ?? oi.StallItem?.Name ?? "Unknown",
                        ImageUrl = oi.Product?.ImageUrl ?? oi.StallItem?.ImageUrl,
                        Price = oi.Price,
                        Quantity = oi.Quantity
                    }).ToList() ?? new()
                }).ToList()
            };

            return View(model);
        }

        // Order Detail
        public async Task<IActionResult> Details(int id)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return RedirectToAction("Login", "Account");

            var order = await _db.Orders
                .Where(o => o.Id == id && o.UserId == user.Id)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Product)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.StallItem)
                .FirstOrDefaultAsync();

            if (order == null) return RedirectToAction("Index");

            var model = new OrderSummaryViewModel
            {
                OrderId = order.Id,
                CreatedAt = order.CreatedAt,
                Status = order.Status,
                TotalAmount = order.TotalAmount,
                PaymentMethod = order.PaymentMethod,
                ShippingAddress = order.ShippingAddress,
                ItemCount = order.OrderItems?.Sum(oi => oi.Quantity) ?? 0,
                Items = order.OrderItems?.Select(oi => new OrderItemDetailViewModel
                {
                    ProductName = oi.Product?.Name ?? oi.StallItem?.Name ?? "Unknown",
                    ImageUrl = oi.Product?.ImageUrl ?? oi.StallItem?.ImageUrl,
                    Price = oi.Price,
                    Quantity = oi.Quantity
                }).ToList() ?? new()
            };

            return View(model);
        }

        // Checkout GET - show checkout page
        [HttpGet]
        public async Task<IActionResult> Checkout()
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

            if (cart == null || cart.CartItems == null || !cart.CartItems.Any())
                return RedirectToAction("Index", "Cart");

            var model = new CheckoutViewModel
            {
                Items = cart.CartItems.Select(ci => new CartItemViewModel
                {
                    CartItemId = ci.Id,
                    ProductId = ci.ProductId,
                    StallItemId = ci.StallItemId,
                    ProductName = ci.Product?.Name ?? ci.StallItem?.Name ?? "Unknown",
                    ImageUrl = ci.Product?.ImageUrl ?? ci.StallItem?.ImageUrl,
                    Price = ci.Product?.Price ?? ci.StallItem?.Price ?? 0,
                    Quantity = ci.Quantity,
                    CategoryName = ci.Product?.Category?.Name ?? "Stall Item"
                }).ToList(),
                ShippingAddress = user.Address ?? ""
            };

            return View(model);
        }

        // Checkout POST - place order
        [HttpPost]
        public async Task<IActionResult> PlaceOrder(CheckoutViewModel model)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return RedirectToAction("Login", "Account");

            var cart = await _db.Carts
                .Include(c => c.CartItems)
                    .ThenInclude(ci => ci.Product)
                .Include(c => c.CartItems)
                    .ThenInclude(ci => ci.StallItem)
                .FirstOrDefaultAsync(c => c.UserId == user.Id);

            if (cart == null || cart.CartItems == null || !cart.CartItems.Any())
                return RedirectToAction("Index", "Cart");

            var order = new Order
            {
                UserId = user.Id,
                Status = "Completed",
                TotalAmount = (int)cart.CartItems.Sum(ci => (ci.Product?.Price ?? ci.StallItem?.Price ?? 0) * ci.Quantity),
                ShippingAddress = model.ShippingAddress,
                PaymentMethod = model.PaymentMethod ?? "Cash on Delivery",
                CreatedAt = DateTime.UtcNow,
                OrderItems = cart.CartItems.Select(ci => new OrderItem
                {
                    ProductId = ci.ProductId,
                    StallItemId = ci.StallItemId,
                    Quantity = ci.Quantity,
                    Price = ci.Product?.Price ?? ci.StallItem?.Price ?? 0
                }).ToList()
            };

            _db.Orders.Add(order);
            _db.CartItems.RemoveRange(cart.CartItems);
            await _db.SaveChangesAsync();

            return RedirectToAction("Details", new { id = order.Id });
        }
    }
}
