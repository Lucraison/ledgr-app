using Ledgr.API.Data;
using Ledgr.API.Models;
using Microsoft.EntityFrameworkCore;

namespace Ledgr.API.Services;

public class RecurringTransactionService(IServiceScopeFactory scopeFactory, ILogger<RecurringTransactionService> logger)
    : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await ProcessDueTransactionsAsync();

        using var timer = new PeriodicTimer(TimeSpan.FromHours(24));
        while (await timer.WaitForNextTickAsync(stoppingToken))
        {
            await ProcessDueTransactionsAsync();
        }
    }

    private async Task ProcessDueTransactionsAsync()
    {
        using var scope = scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var today = DateTime.UtcNow.Date;

        var due = await db.Transactions
            .Where(t => t.IsRecurring && t.NextOccurrence.HasValue && t.NextOccurrence.Value.Date <= today)
            .ToListAsync();

        foreach (var template in due)
        {
            var generated = new Transaction
            {
                Amount = template.Amount,
                Type = template.Type,
                Description = template.Description,
                Notes = template.Notes,
                CategoryId = template.CategoryId,
                UserId = template.UserId,
                Date = DateTime.SpecifyKind(template.NextOccurrence!.Value.Date, DateTimeKind.Utc),
                IsRecurring = false,
                ParentTransactionId = template.Id
            };
            db.Transactions.Add(generated);

            template.NextOccurrence = template.Frequency switch
            {
                RecurringFrequency.Daily   => template.NextOccurrence.Value.AddDays(1),
                RecurringFrequency.Weekly  => template.NextOccurrence.Value.AddDays(7),
                RecurringFrequency.Monthly => template.NextOccurrence.Value.AddMonths(1),
                RecurringFrequency.Yearly  => template.NextOccurrence.Value.AddYears(1),
                _                          => null
            };
        }

        await db.SaveChangesAsync();
        logger.LogInformation("RecurringTransactionService: processed {Count} due templates.", due.Count);
    }
}
