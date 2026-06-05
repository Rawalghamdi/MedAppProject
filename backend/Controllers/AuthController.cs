using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MedApp.Data;
using MedApp.DTOs;
using MedApp.Models;

namespace MedApp.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;

    public AuthController(AppDbContext db)
    {
        _db = db;
    }

    // hash the password before saving — we never store plain text passwords
    // "medapp_salt" is mixed in so two users with the same password get different hashes
    private static string HashPassword(string password)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(password + "medapp_salt"));
        return Convert.ToHexString(bytes).ToLower();
    }

    // the "token" is just the user id encoded in base64 — simple but works for this project
    private static string MakeToken(int userId)
    {
        var raw = $"{userId}:{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}";
        return Convert.ToBase64String(Encoding.UTF8.GetBytes(raw));
    }

    // returns only the fields the frontend needs, not the password hash
    private static object FormatUser(User user)
    {
        return new
        {
            id        = user.Id,
            name      = user.Name,
            email     = user.Email,
            role      = user.Role,
            phone     = user.Phone,
            createdAt = user.CreatedAt.ToString("o"),
        };
    }

    // POST /api/auth/login
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest dto)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);

        // check email exists and password matches
        if (user == null || user.PasswordHash != HashPassword(dto.Password))
            return Unauthorized(new { error = "Invalid email or password" });

        return Ok(new { token = MakeToken(user.Id), user = FormatUser(user) });
    }

    // POST /api/auth/register
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest dto)
    {
        if (await _db.Users.AnyAsync(u => u.Email == dto.Email))
            return BadRequest(new { error = "Email already registered" });

        var user = new User
        {
            Name         = dto.Name,
            Email        = dto.Email,
            PasswordHash = HashPassword(dto.Password),
            Phone        = dto.Phone,
            Role         = "patient", // new registrations are always patients
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        return StatusCode(201, new { token = MakeToken(user.Id), user = FormatUser(user) });
    }

    // GET /api/auth/me  — returns the current logged in user
    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> Me()
    {
        var idClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (idClaim == null) return Unauthorized();

        var user = await _db.Users.FindAsync(int.Parse(idClaim));
        if (user == null) return Unauthorized();

        return Ok(FormatUser(user));
    }
}
