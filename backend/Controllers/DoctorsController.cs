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
[Route("api/[controller]")]
public class DoctorsController : ControllerBase
{
    private readonly AppDbContext _db;

    public DoctorsController(AppDbContext db)
    {
        _db = db;
    }

    private static string HashPassword(string password)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(password + "medapp_salt"));
        return Convert.ToHexString(bytes).ToLower();
    }

    // flattens the Doctor + User into one simple object for the frontend
    private static object FormatDoctor(Doctor d)
    {
        return new
        {
            id        = d.Id,
            userId    = d.UserId,
            name      = d.User.Name,
            email     = d.User.Email,
            phone     = d.User.Phone,
            specialty = d.Specialty,
            clinic    = d.Clinic,
            city      = d.City,
            bio       = d.Bio,
            createdAt = d.CreatedAt.ToString("o"),
        };
    }

    // GET /api/doctors  — anyone can browse the doctor list
    [HttpGet]
    public async Task<IActionResult> List()
    {
        var doctors = await _db.Doctors
            .Include(d => d.User)
            .OrderBy(d => d.Id)
            .ToListAsync();

        return Ok(doctors.Select(FormatDoctor));
    }

    // GET /api/doctors/{id}
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var doctor = await _db.Doctors
            .Include(d => d.User)
            .FirstOrDefaultAsync(d => d.Id == id);

        if (doctor == null)
            return NotFound(new { error = "Doctor not found" });

        return Ok(FormatDoctor(doctor));
    }

    // POST /api/doctors  — admin only
    // creates both a user account and a doctor profile in one go
    [HttpPost]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Create([FromBody] CreateDoctorRequest dto)
    {
        if (await _db.Users.AnyAsync(u => u.Email == dto.Email))
            return BadRequest(new { error = "Email already registered" });

        // step 1: create the login account
        var user = new User
        {
            Name         = dto.Name,
            Email        = dto.Email,
            PasswordHash = HashPassword(dto.Password),
            Phone        = dto.Phone,
            Role         = "doctor",
        };
        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        // step 2: create the doctor profile linked to that account
        var doctor = new Doctor
        {
            UserId    = user.Id,
            Specialty = dto.Specialty,
            Clinic    = dto.Clinic,
            City      = dto.City,
            Bio       = dto.Bio,
        };
        _db.Doctors.Add(doctor);
        await _db.SaveChangesAsync();

        // re-fetch with the User included so we can return the full object
        var created = await _db.Doctors
            .Include(d => d.User)
            .FirstAsync(d => d.Id == doctor.Id);

        return StatusCode(201, FormatDoctor(created));
    }

    // PATCH /api/doctors/{id}  — admin only
    // only updates fields that were actually sent (null = don't change it)
    [HttpPatch("{id:int}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateDoctorRequest dto)
    {
        var doctor = await _db.Doctors
            .Include(d => d.User)
            .FirstOrDefaultAsync(d => d.Id == id);

        if (doctor == null)
            return NotFound(new { error = "Doctor not found" });

        if (!string.IsNullOrWhiteSpace(dto.Name))      doctor.User.Name  = dto.Name;
        if (!string.IsNullOrWhiteSpace(dto.Phone))     doctor.User.Phone = dto.Phone;
        if (!string.IsNullOrWhiteSpace(dto.Specialty)) doctor.Specialty  = dto.Specialty;
        if (!string.IsNullOrWhiteSpace(dto.Clinic))    doctor.Clinic     = dto.Clinic;
        if (!string.IsNullOrWhiteSpace(dto.City))      doctor.City       = dto.City;
        if (dto.Bio != null)                            doctor.Bio        = dto.Bio;

        await _db.SaveChangesAsync();
        return Ok(FormatDoctor(doctor));
    }

    // DELETE /api/doctors/{id}  — admin only
    // deletes the doctor profile first, then the user account
    [HttpDelete("{id:int}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var doctor = await _db.Doctors.FirstOrDefaultAsync(d => d.Id == id);

        if (doctor == null)
            return NotFound(new { error = "Doctor not found" });

        int userId = doctor.UserId;

        _db.Doctors.Remove(doctor);
        await _db.SaveChangesAsync();

        var user = await _db.Users.FindAsync(userId);
        if (user != null)
        {
            _db.Users.Remove(user);
            await _db.SaveChangesAsync();
        }

        return NoContent();
    }
}
