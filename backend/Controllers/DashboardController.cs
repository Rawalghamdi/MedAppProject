using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MedApp.Data;

namespace MedApp.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "admin")]
public class DashboardController : ControllerBase
{
    private readonly AppDbContext _db;

    public DashboardController(AppDbContext db)
    {
        _db = db;
    }

    // GET /api/dashboard/stats
    [HttpGet("stats")]
    public async Task<IActionResult> Stats()
    {
        var stats = new
        {
            totalAppointments     = await _db.Appointments.CountAsync(),
            pendingAppointments   = await _db.Appointments.CountAsync(a => a.Status == "pending"),
            confirmedAppointments = await _db.Appointments.CountAsync(a => a.Status == "confirmed"),
            completedAppointments = await _db.Appointments.CountAsync(a => a.Status == "completed"),
            cancelledAppointments = await _db.Appointments.CountAsync(a => a.Status == "cancelled"),
            totalDoctors          = await _db.Doctors.CountAsync(),
            totalPatients         = await _db.Users.CountAsync(u => u.Role == "patient"),
        };

        return Ok(stats);
    }

    // GET /api/dashboard/recent-appointments  — last 10 appointments, newest first
    [HttpGet("recent-appointments")]
    public async Task<IActionResult> RecentAppointments()
    {
        var recent = await _db.Appointments
            .Include(a => a.Doctor).ThenInclude(d => d.User)
            .Include(a => a.Patient)
            .OrderByDescending(a => a.CreatedAt)
            .Take(10)
            .ToListAsync();

        var result = recent.Select(a => new
        {
            id          = a.Id,
            doctorId    = a.DoctorId,
            patientId   = a.PatientId,
            doctorName  = a.Doctor.User.Name,
            patientName = a.Patient.Name,
            specialty   = a.Doctor.Specialty,
            clinic      = a.Doctor.Clinic,
            city        = a.Doctor.City,
            date        = a.Date,
            time        = a.Time,
            reason      = a.Reason,
            status      = a.Status,
            createdAt   = a.CreatedAt.ToString("o"),
        });

        return Ok(result);
    }
}
