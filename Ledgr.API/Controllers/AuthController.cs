using Ledgr.API.Data;
using Ledgr.API.Models;
using Ledgr.API.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Ledgr.API.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(AppDbContext db, TokenService tokens) : ControllerBase
{
    public record AuthRequest(string Username, string Password);

    [HttpPost("register")]
    public async Task<IActionResult> Register(AuthRequest req)
    {
        if (await db.Users.AnyAsync(u => u.Username.ToLower() == req.Username.ToLower()))
            return BadRequest("Username already taken.");

        var isFirstUser = !await db.Users.AnyAsync();
        var user = new User
        {
            Username = req.Username,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password),
            IsAdmin = isFirstUser
        };
        db.Users.Add(user);
        await db.SaveChangesAsync();

        db.Categories.AddRange(
            new Category { Name = "Salary",        Color = "#22c55e", UserId = user.Id },
            new Category { Name = "Food",          Color = "#f97316", UserId = user.Id },
            new Category { Name = "Transport",     Color = "#3b82f6", UserId = user.Id },
            new Category { Name = "Entertainment", Color = "#a855f7", UserId = user.Id },
            new Category { Name = "Health",        Color = "#f43f5e", UserId = user.Id }
        );
        await db.SaveChangesAsync();

        return Ok(new { token = tokens.Generate(user) });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(AuthRequest req)
    {
        var user = await db.Users.FirstOrDefaultAsync(u => u.Username.ToLower() == req.Username.ToLower());
        if (user is null || !BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash))
            return Unauthorized("Invalid credentials.");
        return Ok(new { token = tokens.Generate(user) });
    }
}
