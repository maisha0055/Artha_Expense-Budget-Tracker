using FinanceTracker.Api.Models;

namespace FinanceTracker.Api.Services;

public interface ITokenService
{
    string GenerateToken(User user);
}
