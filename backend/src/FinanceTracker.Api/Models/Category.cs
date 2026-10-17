namespace FinanceTracker.Api.Models;

public class Category
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Name { get; set; } = string.Empty;

    public User User { get; set; } = null!;
    public ICollection<Budget> Budgets { get; set; } = new List<Budget>();
    public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
}
