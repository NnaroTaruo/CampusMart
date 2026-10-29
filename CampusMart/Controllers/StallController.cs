using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CampusMart.Controllers
{
    [Authorize]
    public class StallController : Controller
    {
        private readonly CampusMart.Data.AppDbContext _db;

        public StallController(CampusMart.Data.AppDbContext db)
        {
            _db = db;
        }

        public async System.Threading.Tasks.Task<IActionResult> Index(int id)
        {
            var stall = await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.FirstOrDefaultAsync(
                _db.Stalls.Include(s => s.StallItems.Where(i => i.Status == "Approved")),
                s => s.Id == id);

            if (stall == null) return NotFound();

            return View(stall);
        }
    }
}
