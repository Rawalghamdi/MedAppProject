using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication;
using MedApp.Data;
using MedApp.Security;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

// connect to postgres using the connection string from appsettings.json
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// our custom auth reads the x-user-id header to know who is logged in
builder.Services.AddAuthentication("UserIdScheme")
    .AddScheme<AuthenticationSchemeOptions, UserIdAuthHandler>("UserIdScheme", null);

builder.Services.AddAuthorization();

// allow the React frontend (running on a different port) to call this API
builder.Services.AddCors(options =>
    options.AddPolicy("AllowFrontend", policy =>
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader()));

// Swagger gives us a UI to test the API at /swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
    c.SwaggerDoc("v1", new() { Title = "MedApp API", Version = "v1" }));

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();
