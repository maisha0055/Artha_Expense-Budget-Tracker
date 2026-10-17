namespace FinanceTracker.Api.Services;

public static class BudgetStatusCalculator
{
    public const string StatusNone = "None";
    public const string StatusOk = "Ok";
    public const string StatusWarning = "Warning";
    public const string StatusExceeded = "Exceeded";

    /// <summary>
    /// Calculates the status based on limit and spent amount:
    /// - None: no budget (limit null or non-positive)
    /// - Ok: spent &lt; 80% of limit
    /// - Warning: spent &gt;= 80% and &lt; 100% of limit
    /// - Exceeded: spent &gt;= 100% of limit
    /// </summary>
    public static string CalculateStatus(decimal? limit, decimal spent)
    {
        if (!limit.HasValue || limit.Value <= 0)
        {
            return StatusNone;
        }

        var percent = (spent / limit.Value) * 100m;

        if (percent < 80m)
        {
            return StatusOk;
        }

        if (percent < 100m)
        {
            return StatusWarning;
        }

        return StatusExceeded;
    }

    /// <summary>
    /// Calculates percentage of budget limit used, rounded to 1 decimal place using AwayFromZero.
    /// Returns null if limit is not set or non-positive.
    /// </summary>
    public static double? CalculatePercentUsed(decimal? limit, decimal spent)
    {
        if (!limit.HasValue || limit.Value <= 0)
        {
            return null;
        }

        var percent = (spent / limit.Value) * 100m;
        return (double)Math.Round(percent, 1, MidpointRounding.AwayFromZero);
    }
}
