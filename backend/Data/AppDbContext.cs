using Microsoft.EntityFrameworkCore;
using MedApp.Models;

namespace MedApp.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users { get; set; }
    public DbSet<Doctor> Doctors { get; set; }
    public DbSet<Appointment> Appointments { get; set; }

    // this maps our C# class properties to the actual postgres column names
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(e =>
        {
            e.ToTable("users");
            e.HasKey(u => u.Id);
            e.Property(u => u.Id).HasColumnName("id");
            e.Property(u => u.Name).HasColumnName("name");
            e.Property(u => u.Email).HasColumnName("email").IsRequired();
            e.HasIndex(u => u.Email).IsUnique(); // no two users can share an email
            e.Property(u => u.PasswordHash).HasColumnName("password_hash");
            e.Property(u => u.Role).HasColumnName("role").HasDefaultValue("patient");
            e.Property(u => u.Phone).HasColumnName("phone");
            e.Property(u => u.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("NOW()");

            // deleting a user also deletes their doctor profile
            e.HasOne(u => u.DoctorProfile)
             .WithOne(d => d.User)
             .HasForeignKey<Doctor>(d => d.UserId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Doctor>(e =>
        {
            e.ToTable("doctors");
            e.HasKey(d => d.Id);
            e.Property(d => d.Id).HasColumnName("id");
            e.Property(d => d.UserId).HasColumnName("user_id");
            e.Property(d => d.Specialty).HasColumnName("specialty");
            e.Property(d => d.Clinic).HasColumnName("clinic");
            e.Property(d => d.City).HasColumnName("city");
            e.Property(d => d.Bio).HasColumnName("bio").IsRequired(false);
            e.Property(d => d.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("NOW()");
        });

        modelBuilder.Entity<Appointment>(e =>
        {
            e.ToTable("appointments");
            e.HasKey(a => a.Id);
            e.Property(a => a.Id).HasColumnName("id");
            e.Property(a => a.DoctorId).HasColumnName("doctor_id");
            e.Property(a => a.PatientId).HasColumnName("patient_id");
            e.Property(a => a.Date).HasColumnName("date");
            e.Property(a => a.Time).HasColumnName("time");
            e.Property(a => a.Reason).HasColumnName("reason");
            e.Property(a => a.Status).HasColumnName("status").HasDefaultValue("pending");
            e.Property(a => a.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("NOW()");

            // deleting a doctor removes all their appointments too
            e.HasOne(a => a.Doctor)
             .WithMany(d => d.Appointments)
             .HasForeignKey(a => a.DoctorId)
             .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(a => a.Patient)
             .WithMany()
             .HasForeignKey(a => a.PatientId)
             .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
