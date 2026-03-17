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
    public record AuthRequest(string Username, string Password, string Language = "en");

    static readonly Dictionary<string, string[]> CategoryNames = new()
    {
        ["en"] = ["Salary", "Food", "Transport", "Entertainment", "Health"],
        ["es"] = ["Salario", "Comida", "Transporte", "Entretenimiento", "Salud"],
        ["fr"] = ["Salaire", "Nourriture", "Transport", "Divertissement", "Santé"],
    };

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

        var lang = CategoryNames.ContainsKey(req.Language) ? req.Language : "en";
        var names = CategoryNames[lang];
        var colors = new[] { "#22c55e", "#f97316", "#3b82f6", "#a855f7", "#f43f5e" };
        db.Categories.AddRange(names.Select((name, i) => new Category { Name = name, Color = colors[i], UserId = user.Id }));
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
