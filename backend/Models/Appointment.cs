namespace MedApp.Models;

public class Appointment
{
    public int Id { get; set; }
    public int DoctorId { get; set; }
    public int PatientId { get; set; }
    public string Date { get; set; } = string.Empty;    // stored as YYYY-MM-DD
    public string Time { get; set; } = string.Empty;    // stored as HH:MM
    public string Reason { get; set; } = string.Empty;
    public string Status { get; set; } = "pending";     // pending → confirmed → completed (or cancelled)
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Doctor Doctor { get; set; } = null!;
    public User Patient { get; set; } = null!;
}
