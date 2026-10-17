namespace FinanceTracker.Api.Models;

public class Transaction
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int CategoryId { get; set; }
    public decimal Amount { get; set; }
    public TransactionType Type { get; set; }
    public DateOnly Date { get; set; }
    public string? Note { get; set; }

    public User User { get; set; } = null!;
    public Category Category { get; set; } = null!;
}
