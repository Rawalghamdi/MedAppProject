using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MedApp.Data;
using MedApp.DTOs;
using MedApp.Models;

namespace MedApp.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AppointmentsController : ControllerBase
{
    private readonly AppDbContext _db;

    public AppointmentsController(AppDbContext db)
    {
        _db = db;
    }

    // always include the doctor (and their user) + the patient so we have their names
    private IQueryable<Appointment> QueryWithDetails()
    {
        return _db.Appointments
            .Include(a => a.Doctor).ThenInclude(d => d.User)
            .Include(a => a.Patient);
    }

    private static object FormatAppointment(Appointment a)
    {
        return new
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
        };
    }

    // GET /api/appointments
    // optional query params: ?patientId=5  or  ?doctorId=2
    [HttpGet]
    public async Task<IActionResult> List([FromQuery] int? patientId, [FromQuery] int? doctorId)
    {
        var query = QueryWithDetails();

        if (patientId.HasValue)
            query = query.Where(a => a.PatientId == patientId.Value);

        if (doctorId.HasValue)
            query = query.Where(a => a.DoctorId == doctorId.Value);

        var results = await query.OrderBy(a => a.CreatedAt).ToListAsync();
        return Ok(results.Select(FormatAppointment));
    }

    // GET /api/appointments/{id}
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var appt = await QueryWithDetails().FirstOrDefaultAsync(a => a.Id == id);

        if (appt == null)
            return NotFound(new { error = "Appointment not found" });

        return Ok(FormatAppointment(appt));
    }

    // POST /api/appointments
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateAppointmentRequest dto)
    {
        if (!await _db.Doctors.AnyAsync(d => d.Id == dto.DoctorId))
            return NotFound(new { error = "Doctor not found" });

        if (!await _db.Users.AnyAsync(u => u.Id == dto.PatientId))
            return NotFound(new { error = "Patient not found" });

        var appt = new Appointment
        {
            DoctorId  = dto.DoctorId,
            PatientId = dto.PatientId,
            Date      = dto.Date,
            Time      = dto.Time,
            Reason    = dto.Reason,
            Status    = "pending",  // always starts as pending
        };

        _db.Appointments.Add(appt);
        await _db.SaveChangesAsync();

        // re-fetch so the response includes doctor/patient names
        var created = await QueryWithDetails().FirstAsync(a => a.Id == appt.Id);
        return StatusCode(201, FormatAppointment(created));
    }

    // PATCH /api/appointments/{id}  — only doctors and admins can edit
    [HttpPatch("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateAppointmentRequest dto)
    {
        var appt = await _db.Appointments.FindAsync(id);

        if (appt == null)
            return NotFound(new { error = "Appointment not found" });

        var role = User.FindFirstValue(ClaimTypes.Role) ?? "";

        if (role != "admin" && role != "doctor")
            return Forbid();

        if (!string.IsNullOrWhiteSpace(dto.Status)) appt.Status = dto.Status;
        if (!string.IsNullOrWhiteSpace(dto.Date))   appt.Date   = dto.Date;
        if (!string.IsNullOrWhiteSpace(dto.Time))   appt.Time   = dto.Time;
        if (!string.IsNullOrWhiteSpace(dto.Reason)) appt.Reason = dto.Reason;

        await _db.SaveChangesAsync();

        var updated = await QueryWithDetails().FirstAsync(a => a.Id == id);
        return Ok(FormatAppointment(updated));
    }

    // DELETE /api/appointments/{id}
    // we don't actually delete — just set status to cancelled so history is kept
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Cancel(int id)
    {
        var appt = await _db.Appointments.FindAsync(id);

        if (appt == null)
            return NotFound(new { error = "Appointment not found" });

        appt.Status = "cancelled";
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
