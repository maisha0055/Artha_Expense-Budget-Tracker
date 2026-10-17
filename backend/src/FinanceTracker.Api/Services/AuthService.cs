using FinanceTracker.Api.Data;
using FinanceTracker.Api.Dtos.Auth;
using FinanceTracker.Api.Exceptions;
using FinanceTracker.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace FinanceTracker.Api.Services;

public class AuthService : IAuthService
{
    private static readonly string[] DefaultCategories =
    {
        "Food",
        "Transport",
        "Rent",
        "Utilities",
        "Entertainment",
        "Health",
        "Salary",
        "Other"
    };

    private readonly AppDbContext _dbContext;
    private readonly ITokenService _tokenService;

    public AuthService(AppDbContext dbContext, ITokenService tokenService)
    {
        _dbContext = dbContext;
        _tokenService = tokenService;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();

        var emailExists = await _dbContext.Users
            .AnyAsync(u => u.Email == normalizedEmail, cancellationToken);

        if (emailExists)
        {
            throw new EmailAlreadyExistsException("A user with this email address already exists.");
        }

        var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

        var user = new User
        {
            Name = request.Name.Trim(),
            Email = normalizedEmail,
            PasswordHash = passwordHash
        };

        foreach (var categoryName in DefaultCategories)
        {
            user.Categories.Add(new Category
            {
                Name = categoryName
            });
        }

        _dbContext.Users.Add(user);
        await _dbContext.SaveChangesAsync(cancellationToken);

        var token = _tokenService.GenerateToken(user);

        return new AuthResponse(token, new UserDto(user.Id, user.Name, user.Email));
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();

        var user = await _dbContext.Users
            .FirstOrDefaultAsync(u => u.Email == normalizedEmail, cancellationToken);

        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            throw new InvalidCredentialsException("Invalid email or password.");
        }

        var token = _tokenService.GenerateToken(user);

        return new AuthResponse(token, new UserDto(user.Id, user.Name, user.Email));
    }
}
