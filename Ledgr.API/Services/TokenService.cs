using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Ledgr.API.Models;
using Microsoft.IdentityModel.Tokens;

namespace Ledgr.API.Services;

public class TokenService(IConfiguration config)
{
    public string Generate(User user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(
            claims: [new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()), new Claim(ClaimTypes.Name, user.Username), new Claim("isAdmin", user.IsAdmin.ToString())],
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: creds
        );
        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
