using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using CampusMart.Data;
using CampusMart.Models.Entities;

namespace CampusMart.Areas.Admin.Controllers
{
    [Area("Admin")]
    [Authorize(Roles = "Admin")]
    [Route("Admin/[controller]")]
    [IgnoreAntiforgeryToken]
    public class FloorApiController : Controller
    {
        private readonly AppDbContext _db;
        private readonly IWebHostEnvironment _env;

        public FloorApiController(AppDbContext db, IWebHostEnvironment env)
        {
            _db = db;
            _env = env;
        }

        // ── FLOORS ──

        [HttpGet("floors")]
        public async Task<IActionResult> GetFloors()
        {
            var floors = await _db.Floors
                .Include(f => f.Stalls)
                .OrderBy(f => f.FloorNumber)
                .Select(f => new
                {
                    f.Id,
                    f.Name,
                    f.FloorNumber,
                    f.Capacity,
                    StallCount = f.Stalls.Count(s => s.IsActive),
                    TotalStalls = f.Stalls.Count
                })
                .ToListAsync();

            return Json(floors);
        }

        [HttpPost("floors")]
        public async Task<IActionResult> CreateFloor([FromBody] FloorDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
                return BadRequest("Floor name is required.");

            var floor = new Floor
            {
                Name = dto.Name,
                FloorNumber = dto.FloorNumber,
                Capacity = dto.Capacity > 0 ? dto.Capacity : 8
            };

            _db.Floors.Add(floor);
            await _db.SaveChangesAsync();

            return Json(new { floor.Id, floor.Name, floor.FloorNumber, floor.Capacity, StallCount = 0, TotalStalls = 0 });
        }

        [HttpDelete("floors/{id}")]
        public async Task<IActionResult> DeleteFloor(int id)
        {
            var floor = await _db.Floors.FindAsync(id);
            if (floor == null) return NotFound();

            _db.Floors.Remove(floor);
            await _db.SaveChangesAsync();
            return Ok();
        }

        // ── STALLS ──

        [HttpGet("floors/{floorId}/stalls")]
        public async Task<IActionResult> GetStalls(int floorId)
        {
            var stalls = await _db.Stalls
                .Where(s => s.FloorId == floorId)
                .OrderBy(s => s.StallNumber)
                .Select(s => new
                {
                    s.Id,
                    s.Name,
                    s.StallNumber,
                    s.OwnerName,
                    s.Category,
                    s.Description,
                    s.ImageUrl,
                    s.OpenTime,
                    s.CloseTime,
                    s.IsActive,
                    s.FloorId,
                    ItemCount = s.StallItems.Count
                })
                .ToListAsync();

            return Json(stalls);
        }

        [HttpPost("stalls")]
        public async Task<IActionResult> CreateStall([FromForm] StallCreateDto dto)
        {
            var floor = await _db.Floors.FindAsync(dto.FloorId);
            if (floor == null) return BadRequest("Floor not found.");

            string? imageUrl = null;
            if (dto.Image != null && dto.Image.Length > 0)
            {
                var uploadsFolder = Path.Combine(_env.WebRootPath, "images", "stalls");
                if (!Directory.Exists(uploadsFolder))
                    Directory.CreateDirectory(uploadsFolder);

                var fileName = Guid.NewGuid() + "_" + dto.Image.FileName;
                var filePath = Path.Combine(uploadsFolder, fileName);
                using var stream = new FileStream(filePath, FileMode.Create);
                await dto.Image.CopyToAsync(stream);
                imageUrl = "/images/stalls/" + fileName;
            }

            var stall = new Stall
            {
                Name = dto.Name ?? "",
                StallNumber = dto.StallNumber ?? "",
                OwnerName = dto.OwnerName ?? "",
                Category = dto.Category ?? "",
                Description = dto.Description ?? "",
                ImageUrl = imageUrl,
                OpenTime = dto.OpenTime ?? "08:00",
                CloseTime = dto.CloseTime ?? "20:00",
                IsActive = true,
                FloorId = dto.FloorId
            };

            _db.Stalls.Add(stall);
            await _db.SaveChangesAsync();

            return Json(new
            {
                stall.Id,
                stall.Name,
                stall.StallNumber,
                stall.OwnerName,
                stall.Category,
                stall.Description,
                stall.ImageUrl,
                stall.OpenTime,
                stall.CloseTime,
                stall.IsActive,
                stall.FloorId,
                ItemCount = 0
            });
        }

        [HttpPut("stalls/{id}")]
        public async Task<IActionResult> UpdateStall(int id, [FromForm] StallCreateDto dto)
        {
            var stall = await _db.Stalls.FindAsync(id);
            if (stall == null) return NotFound();

            stall.Name = dto.Name ?? stall.Name;
            stall.StallNumber = dto.StallNumber ?? stall.StallNumber;
            stall.OwnerName = dto.OwnerName ?? stall.OwnerName;
            stall.Category = dto.Category ?? stall.Category;
            stall.Description = dto.Description ?? stall.Description;
            stall.OpenTime = dto.OpenTime ?? stall.OpenTime;
            stall.CloseTime = dto.CloseTime ?? stall.CloseTime;

            if (dto.Image != null && dto.Image.Length > 0)
            {
                var uploadsFolder = Path.Combine(_env.WebRootPath, "images", "stalls");
                if (!Directory.Exists(uploadsFolder))
                    Directory.CreateDirectory(uploadsFolder);

                var fileName = Guid.NewGuid() + "_" + dto.Image.FileName;
                var filePath = Path.Combine(uploadsFolder, fileName);
                using var stream = new FileStream(filePath, FileMode.Create);
                await dto.Image.CopyToAsync(stream);
                stall.ImageUrl = "/images/stalls/" + fileName;
            }

            await _db.SaveChangesAsync();
            return Json(new { stall.Id, stall.Name, stall.StallNumber, stall.OwnerName, stall.Category, stall.ImageUrl, stall.OpenTime, stall.CloseTime, stall.IsActive, stall.FloorId });
        }

        [HttpPost("stalls/{id}/toggle")]
        public async Task<IActionResult> ToggleStall(int id)
        {
            var stall = await _db.Stalls.FindAsync(id);
            if (stall == null) return NotFound();

            stall.IsActive = !stall.IsActive;
            await _db.SaveChangesAsync();
            return Json(new { stall.Id, stall.IsActive });
        }

        [HttpDelete("stalls/{id}")]
        public async Task<IActionResult> DeleteStall(int id)
        {
            var stall = await _db.Stalls.FindAsync(id);
            if (stall == null) return NotFound();

            _db.Stalls.Remove(stall);
            await _db.SaveChangesAsync();
            return Ok();
        }

        // ── STALL ITEMS ──

        [HttpGet("stalls/{stallId}/items")]
        public async Task<IActionResult> GetStallItems(int stallId)
        {
            var items = await _db.StallItems
                .Where(i => i.StallId == stallId)
                .OrderBy(i => i.Name)
                .Select(i => new { i.Id, i.Name, i.Price, i.Description, i.ImageUrl, i.Stock, i.StallId })
                .ToListAsync();

            return Json(items);
        }

        [HttpPost("stall-items")]
        public async Task<IActionResult> CreateStallItem([FromForm] StallItemDto dto)
        {
            var stall = await _db.Stalls.FindAsync(dto.StallId);
            if (stall == null) return BadRequest("Stall not found.");

            string? imageUrl = null;
            if (dto.Image != null && dto.Image.Length > 0)
            {
                var uploadsFolder = Path.Combine(_env.WebRootPath, "images", "stall-items");
                if (!Directory.Exists(uploadsFolder))
                    Directory.CreateDirectory(uploadsFolder);

                var fileName = Guid.NewGuid() + "_" + dto.Image.FileName;
                var filePath = Path.Combine(uploadsFolder, fileName);
                using var stream = new FileStream(filePath, FileMode.Create);
                await dto.Image.CopyToAsync(stream);
                imageUrl = "/images/stall-items/" + fileName;
            }

            var item = new StallItem
            {
                Name = dto.Name ?? "",
                Price = dto.Price,
                Description = dto.Description ?? "",
                ImageUrl = imageUrl,
                Stock = dto.Stock,
                StallId = dto.StallId
            };

            _db.StallItems.Add(item);
            await _db.SaveChangesAsync();

            return Json(new { item.Id, item.Name, item.Price, item.Description, item.ImageUrl, item.Stock, item.StallId });
        }

        [HttpDelete("stall-items/{id}")]
        public async Task<IActionResult> DeleteStallItem(int id)
        {
            var item = await _db.StallItems.FindAsync(id);
            if (item == null) return NotFound();

            _db.StallItems.Remove(item);
            await _db.SaveChangesAsync();
            return Ok();
        }
    }

    // ── DTOs ──

    public class FloorDto
    {
        public string? Name { get; set; }
        public int FloorNumber { get; set; }
        public int Capacity { get; set; }
    }

    public class StallCreateDto
    {
        public string? Name { get; set; }
        public string? StallNumber { get; set; }
        public string? OwnerName { get; set; }
        public string? Category { get; set; }
        public string? Description { get; set; }
        public string? OpenTime { get; set; }
        public string? CloseTime { get; set; }
        public int FloorId { get; set; }
        public IFormFile? Image { get; set; }
    }

    public class StallItemDto
    {
        public string? Name { get; set; }
        public decimal Price { get; set; }
        public string? Description { get; set; }
        public int Stock { get; set; }
        public int StallId { get; set; }
        public IFormFile? Image { get; set; }
    }
}
