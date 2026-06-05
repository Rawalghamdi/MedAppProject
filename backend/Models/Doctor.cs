namespace MedApp.Models;

public class Doctor
{
    public int Id { get; set; }
    public int UserId { get; set; }   // links to the user account for this doctor
    public string Specialty { get; set; } = string.Empty;
    public string Clinic { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string? Bio { get; set; }  // optional short description
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;
    public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
}
