using System.Security.Claims;
using Ledgr.API.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Ledgr.API.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize]
public class AdminController(AppDbContext db, IConfiguration config) : ControllerBase
{
    bool IsAdmin => User.FindFirst("isAdmin")?.Value == "True";

    [HttpPost("promote-first")]
    public async Task<IActionResult> PromoteFirst()
    {
        if (await db.Users.AnyAsync(u => u.IsAdmin)) return BadRequest("An admin already exists.");
        var user = await db.Users.FindAsync(UserId);
        if (user is null) return NotFound();
        user.IsAdmin = true;
        await db.SaveChangesAsync();
        return Ok("You are now admin. Log out and back in.");
    }

    int UserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet("users")]
    public async Task<IActionResult> GetUsers()
    {
        if (!IsAdmin) return Forbid();
        var users = await db.Users.Select(u => new { u.Id, u.Username, u.IsAdmin }).ToListAsync();
        return Ok(users);
    }

    [HttpDelete("users/{id}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        if (!IsAdmin) return Forbid();
        var user = await db.Users.FindAsync(id);
        if (user is null) return NotFound();
        if (user.IsAdmin) return BadRequest("Cannot delete an admin account.");
        db.Users.Remove(user);
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("users/{id}/reset-password")]
    public async Task<IActionResult> ResetPassword(int id, ResetPasswordRequest req)
    {
        if (!IsAdmin) return Forbid();
        var user = await db.Users.FindAsync(id);
        if (user is null) return NotFound();
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.NewPassword);
        await db.SaveChangesAsync();
        return Ok();
    }

    [HttpPost("recover")]
    [AllowAnonymous]
    public async Task<IActionResult> RecoverAdmin(RecoverAdminRequest req)
    {
        var secret = config["AdminRecoverySecret"];
        if (string.IsNullOrEmpty(secret) || req.Secret != secret)
            return Unauthorized("Invalid secret.");
        var admin = await db.Users.FirstOrDefaultAsync(u => u.IsAdmin);
        if (admin is null) return NotFound("No admin account found.");
        admin.PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.NewPassword);
        await db.SaveChangesAsync();
        return Ok("Admin password reset.");
    }

    public record ResetPasswordRequest(string NewPassword);
    public record RecoverAdminRequest(string Secret, string NewPassword);
}
