using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using FinanceTracker.Api.Models;
using Microsoft.IdentityModel.Tokens;

namespace FinanceTracker.Api.Services;

public class TokenService : ITokenService
{
    private readonly IConfiguration _configuration;

    public TokenService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public string GenerateToken(User user)
    {
        var secretKey = _configuration["Jwt:Key"]
            ?? _configuration["Jwt:Secret"]
            ?? Environment.GetEnvironmentVariable("Jwt__Key")
            ?? Environment.GetEnvironmentVariable("Jwt__Secret");

        if (string.IsNullOrWhiteSpace(secretKey) || secretKey.Length < 32)
        {
            throw new InvalidOperationException("JWT Secret Key is missing or too short. It must be at least 32 characters long.");
        }

        var issuer = _configuration["Jwt:Issuer"] ?? "FinanceTrackerApi";
        var audience = _configuration["Jwt:Audience"] ?? "FinanceTrackerClient";
        var expiryMinutes = 60;
        if (int.TryParse(_configuration["Jwt:ExpiryMinutes"], out var parsedExpiry))
        {
            expiryMinutes = parsedExpiry;
        }

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(JwtRegisteredClaimNames.Name, user.Name),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddMinutes(expiryMinutes),
            Issuer = issuer,
            Audience = audience,
            SigningCredentials = creds
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);

        return tokenHandler.WriteToken(token);
    }
}
