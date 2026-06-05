using System.ComponentModel.DataAnnotations;

namespace MedApp.DTOs;

// these are the shapes of the JSON body the frontend sends to each endpoint

public record LoginRequest(
    [Required] string Email,
    [Required] string Password
);

public record RegisterRequest(
    [Required] string Name,
    [Required][EmailAddress] string Email,
    [Required][MinLength(6)] string Password,
    [Required] string Phone
);

public record CreateDoctorRequest(
    [Required] string Name,
    [Required][EmailAddress] string Email,
    [Required][MinLength(6)] string Password,
    [Required] string Phone,
    [Required] string Specialty,
    [Required] string Clinic,
    [Required] string City,
    string? Bio  // bio is optional
);

public record UpdateDoctorRequest(
    string? Name,
    string? Phone,
    string? Specialty,
    string? Clinic,
    string? City,
    string? Bio
);

public record CreateAppointmentRequest(
    [Required] int DoctorId,
    [Required] int PatientId,
    [Required] string Date,    // YYYY-MM-DD
    [Required] string Time,    // HH:MM
    [Required] string Reason
);

public record UpdateAppointmentRequest(
    string? Status,  // pending | confirmed | completed | cancelled
    string? Date,
    string? Time,
    string? Reason
);
