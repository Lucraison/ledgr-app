using System.Security.Claims;
using Ledgr.API.Data;
using Ledgr.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Ledgr.API.Controllers;

[ApiController]
[Route("api/categories")]
[Authorize]
public class CategoriesController(AppDbContext db) : ControllerBase
{
    int UserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var cats = await db.Categories.Where(c => c.UserId == UserId).ToListAsync();
        return Ok(cats);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CategoryRequest req)
    {
        var cat = new Category { Name = req.Name, Color = req.Color ?? "#6366f1", UserId = UserId };
        db.Categories.Add(cat);
        await db.SaveChangesAsync();
        return Ok(cat);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, CategoryRequest req)
    {
        var cat = await db.Categories.FirstOrDefaultAsync(c => c.Id == id && c.UserId == UserId);
        if (cat is null) return NotFound();
        cat.Name = req.Name;
        if (req.Color != null) cat.Color = req.Color;
        await db.SaveChangesAsync();
        return Ok(cat);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var cat = await db.Categories.FirstOrDefaultAsync(c => c.Id == id && c.UserId == UserId);
        if (cat is null) return NotFound();
        db.Categories.Remove(cat);
        await db.SaveChangesAsync();
        return NoContent();
    }

    public record CategoryRequest(string Name, string? Color);
}
