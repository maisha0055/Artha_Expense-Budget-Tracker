using System.IdentityModel.Tokens.Jwt;
using FinanceTracker.Api.Data;
using FinanceTracker.Api.Dtos.Auth;
using FinanceTracker.Api.Exceptions;
using FinanceTracker.Api.Models;
using FinanceTracker.Api.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace FinanceTracker.Tests;

public class AuthServiceTests
{
    private readonly IConfiguration _configuration;
    private readonly ITokenService _tokenService;

    public AuthServiceTests()
    {
        var inMemorySettings = new Dictionary<string, string?>
        {
            { "Jwt:Key", "ThisIsASuperSecretKeyForTestingFinanceTracker12345!" },
            { "Jwt:Issuer", "FinanceTrackerApi" },
            { "Jwt:Audience", "FinanceTrackerClient" },
            { "Jwt:ExpiryMinutes", "60" }
        };

        _configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(inMemorySettings)
            .Build();

        _tokenService = new TokenService(_configuration);
    }

    private AppDbContext CreateInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new AppDbContext(options);
    }

    [Fact]
    public async Task RegisterAsync_ValidRequest_CreatesUser_SeedsCategories_AndReturnsToken()
    {
        // Arrange
        using var dbContext = CreateInMemoryDbContext();
        var authService = new AuthService(dbContext, _tokenService);
        var request = new RegisterRequest("Alice Wonderland", "Alice@Example.com", "Password123");

        // Act
        var response = await authService.RegisterAsync(request);

        // Assert
        Assert.NotNull(response);
        Assert.False(string.IsNullOrWhiteSpace(response.Token));
        Assert.Equal("alice@example.com", response.User.Email);
        Assert.Equal("Alice Wonderland", response.User.Name);

        var savedUser = await dbContext.Users
            .Include(u => u.Categories)
            .FirstOrDefaultAsync(u => u.Id == response.User.Id);

        Assert.NotNull(savedUser);
        Assert.Equal("alice@example.com", savedUser.Email);
        Assert.True(BCrypt.Net.BCrypt.Verify("Password123", savedUser.PasswordHash));

        // Verify seeded default categories
        var expectedCategories = new[]
        {
            "Food", "Transport", "Rent", "Utilities", "Entertainment", "Health", "Salary", "Other"
        };
        Assert.Equal(8, savedUser.Categories.Count);
        Assert.Equal(expectedCategories.OrderBy(c => c), savedUser.Categories.Select(c => c.Name).OrderBy(c => c));
    }

    [Fact]
    public async Task RegisterAsync_DuplicateEmail_ThrowsEmailAlreadyExistsException()
    {
        // Arrange
        using var dbContext = CreateInMemoryDbContext();
        var authService = new AuthService(dbContext, _tokenService);
        var firstRequest = new RegisterRequest("User One", "user@test.com", "Password123");
        var duplicateRequest = new RegisterRequest("User Two", "USER@TEST.COM", "Secret456");

        await authService.RegisterAsync(firstRequest);

        // Act & Assert
        await Assert.ThrowsAsync<EmailAlreadyExistsException>(() =>
            authService.RegisterAsync(duplicateRequest));
    }

    [Fact]
    public async Task LoginAsync_ValidCredentials_ReturnsTokenAndUser()
    {
        // Arrange
        using var dbContext = CreateInMemoryDbContext();
        var authService = new AuthService(dbContext, _tokenService);
        await authService.RegisterAsync(new RegisterRequest("Bob Builder", "bob@test.com", "Password123"));

        // Act
        var loginResponse = await authService.LoginAsync(new LoginRequest("BOB@test.com", "Password123"));

        // Assert
        Assert.NotNull(loginResponse);
        Assert.False(string.IsNullOrWhiteSpace(loginResponse.Token));
        Assert.Equal("bob@test.com", loginResponse.User.Email);
    }

    [Fact]
    public async Task LoginAsync_InvalidPassword_ThrowsInvalidCredentialsException()
    {
        // Arrange
        using var dbContext = CreateInMemoryDbContext();
        var authService = new AuthService(dbContext, _tokenService);
        await authService.RegisterAsync(new RegisterRequest("Bob Builder", "bob@test.com", "Password123"));

        // Act & Assert
        await Assert.ThrowsAsync<InvalidCredentialsException>(() =>
            authService.LoginAsync(new LoginRequest("bob@test.com", "WrongPassword999")));
    }

    [Fact]
    public void TokenService_GeneratesValidToken_WithRequiredClaims()
    {
        // Arrange
        var user = new User
        {
            Id = 42,
            Name = "John Doe",
            Email = "john@example.com",
            PasswordHash = "hashed"
        };

        // Act
        var tokenString = _tokenService.GenerateToken(user);
        var handler = new JwtSecurityTokenHandler();
        var jwtToken = handler.ReadJwtToken(tokenString);

        // Assert
        Assert.Equal("42", jwtToken.Claims.First(c => c.Type == JwtRegisteredClaimNames.Sub).Value);
        Assert.Equal("john@example.com", jwtToken.Claims.First(c => c.Type == JwtRegisteredClaimNames.Email).Value);
        Assert.Equal("John Doe", jwtToken.Claims.First(c => c.Type == JwtRegisteredClaimNames.Name).Value);
        Assert.True(jwtToken.ValidTo > DateTime.UtcNow.AddMinutes(55));
    }
}
