using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CampusMart.Data;

namespace CampusMart.Controllers
{
    [Authorize]
    public class UserDashboardController : Controller
    {
        private readonly AppDbContext _db;

        public UserDashboardController(AppDbContext db)
        {
            _db = db;
        }

        public async Task<IActionResult> Index(int? floorId)
        {
            var floors = await _db.Floors
                .OrderBy(f => f.FloorNumber)
                .ToListAsync();

            ViewBag.Floors = floors;

            // Default to first floor if none selected
            var selectedFloor = floorId.HasValue
                ? floors.FirstOrDefault(f => f.Id == floorId.Value)
                : floors.FirstOrDefault();

            ViewBag.SelectedFloor = selectedFloor;

            var stalls = new List<CampusMart.Models.Entities.Stall>();
            if (selectedFloor != null)
            {
                stalls = await _db.Stalls
                    .Where(s => s.FloorId == selectedFloor.Id && s.IsActive)
                    .OrderBy(s => s.StallNumber)
                    .ToListAsync();
            }

            var peerProducts = await _db.Products
                .Include(p => p.Seller)
                .Include(p => p.Category)
                .Where(p => p.Status == "Approved")
                .OrderByDescending(p => p.Id)
                .ToListAsync();

            ViewBag.PeerProducts = peerProducts;

            return View("~/Views/UserDashboard/Index.cshtml", stalls);
        }

        public IActionResult Saved()
        {
            return View("~/Views/UserDashboard/Saved.cshtml");
        }

        public IActionResult Academic()
        {
            return View("~/Views/UserDashboard/Academic.cshtml");
        }
    }
}
