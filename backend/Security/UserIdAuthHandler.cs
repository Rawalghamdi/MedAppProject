using System.Security.Claims;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;
using MedApp.Data;

namespace MedApp.Security;

// instead of JWT tokens, the frontend just sends the user's ID in a header called x-user-id
// this handler reads that header, looks up the user in the database, and sets up their identity
public class UserIdAuthHandler : AuthenticationHandler<AuthenticationSchemeOptions>
{
    private readonly AppDbContext _db;

    public UserIdAuthHandler(
        IOptionsMonitor<AuthenticationSchemeOptions> options,
        ILoggerFactory logger,
        UrlEncoder encoder,
        AppDbContext db) : base(options, logger, encoder)
    {
        _db = db;
    }

    protected override async Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        // if there's no x-user-id header, the request is unauthenticated
        if (!Request.Headers.TryGetValue("x-user-id", out var userIdStr))
            return AuthenticateResult.NoResult();

        if (!int.TryParse(userIdStr, out var userId))
            return AuthenticateResult.Fail("Invalid user id");

        var user = await _db.Users.FindAsync(userId);
        if (user == null)
            return AuthenticateResult.Fail("User not found");

        // build the claims so [Authorize] and [Authorize(Roles = "admin")] work normally
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Name),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role),
        };

        var identity  = new ClaimsIdentity(claims, Scheme.Name);
        var principal = new ClaimsPrincipal(identity);
        var ticket    = new AuthenticationTicket(principal, Scheme.Name);

        return AuthenticateResult.Success(ticket);
    }
}
