namespace MedApp.Models;

public class User
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string Role { get; set; } = "patient"; // can be: admin, doctor, patient
    public string Phone { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // a user might have a doctor profile linked to them
    public Doctor? DoctorProfile { get; set; }
}
