using System.Security.Claims;
using Ledgr.API.Data;
using Ledgr.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Ledgr.API.Controllers;

[ApiController]
[Route("api/transactions")]
[Authorize]
public class TransactionsController(AppDbContext db) : ControllerBase
{
    int UserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int? year, [FromQuery] int? month, [FromQuery] int? categoryId)
    {
        var query = db.Transactions
            .Include(t => t.Category)
            .Where(t => t.UserId == UserId);

        if (year.HasValue) query = query.Where(t => t.Date.Year == year.Value);
        if (month.HasValue) query = query.Where(t => t.Date.Month == month.Value);
        if (categoryId.HasValue) query = query.Where(t => t.CategoryId == categoryId.Value);

        var results = await query.OrderByDescending(t => t.Date).ToListAsync();
        return Ok(results);
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary([FromQuery] int? year, [FromQuery] int? month)
    {
        var query = db.Transactions.Where(t => t.UserId == UserId);
        if (year.HasValue) query = query.Where(t => t.Date.Year == year.Value);
        if (month.HasValue) query = query.Where(t => t.Date.Month == month.Value);

        var transactions = await query.ToListAsync();
        var income = transactions.Where(t => t.Type == "income").Sum(t => t.Amount);
        var expenses = transactions.Where(t => t.Type == "expense").Sum(t => t.Amount);

        return Ok(new { income, expenses, balance = income - expenses });
    }

    [HttpPost]
    public async Task<IActionResult> Create(TransactionRequest req)
    {
        var t = new Transaction
        {
            Amount = req.Amount,
            Type = req.Type,
            Description = req.Description,
            Date = DateTime.SpecifyKind(req.Date ?? DateTime.UtcNow, DateTimeKind.Utc),
            Notes = req.Notes,
            CategoryId = req.CategoryId,
            UserId = UserId,
            IsRecurring = req.IsRecurring,
            Frequency = req.IsRecurring ? req.Frequency : null,
            NextOccurrence = req.IsRecurring && req.NextOccurrence.HasValue
                ? DateTime.SpecifyKind(req.NextOccurrence.Value, DateTimeKind.Utc)
                : null
        };
        db.Transactions.Add(t);
        await db.SaveChangesAsync();
        await db.Entry(t).Reference(x => x.Category).LoadAsync();
        return Ok(t);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, TransactionRequest req)
    {
        var t = await db.Transactions.FirstOrDefaultAsync(t => t.Id == id && t.UserId == UserId);
        if (t is null) return NotFound();
        t.Amount = req.Amount;
        t.Type = req.Type;
        t.Description = req.Description;
        t.Date = DateTime.SpecifyKind(req.Date ?? t.Date, DateTimeKind.Utc);
        t.Notes = req.Notes;
        t.CategoryId = req.CategoryId;
        t.IsRecurring = req.IsRecurring;
        t.Frequency = req.IsRecurring ? req.Frequency : null;
        t.NextOccurrence = req.IsRecurring && req.NextOccurrence.HasValue
            ? DateTime.SpecifyKind(req.NextOccurrence.Value, DateTimeKind.Utc)
            : null;
        await db.SaveChangesAsync();
        await db.Entry(t).Reference(x => x.Category).LoadAsync();
        return Ok(t);
    }

    [HttpGet("projections")]
    public async Task<IActionResult> GetProjections([FromQuery] int year, [FromQuery] int month)
    {
        var today = DateTime.UtcNow.Date;
        var endOfMonth = new DateTime(year, month, DateTime.DaysInMonth(year, month), 23, 59, 59, DateTimeKind.Utc);
        var endOfYear = new DateTime(year, 12, 31, 23, 59, 59, DateTimeKind.Utc);

        // Actual transactions so far this month/year
        var monthTx = await db.Transactions
            .Where(t => t.UserId == UserId && !t.IsRecurring && t.Date.Year == year && t.Date.Month == month)
            .ToListAsync();
        var yearTx = await db.Transactions
            .Where(t => t.UserId == UserId && !t.IsRecurring && t.Date.Year == year)
            .ToListAsync();

        var templates = await db.Transactions
            .Where(t => t.UserId == UserId && t.IsRecurring && t.NextOccurrence.HasValue)
            .ToListAsync();

        decimal projMonthIncome = monthTx.Where(t => t.Type == "income").Sum(t => t.Amount);
        decimal projMonthExpenses = monthTx.Where(t => t.Type == "expense").Sum(t => t.Amount);
        decimal projYearIncome = yearTx.Where(t => t.Type == "income").Sum(t => t.Amount);
        decimal projYearExpenses = yearTx.Where(t => t.Type == "expense").Sum(t => t.Amount);

        foreach (var tmpl in templates)
        {
            var next = tmpl.NextOccurrence!.Value;
            while (next <= endOfYear)
            {
                if (next >= today)
                {
                    if (next <= endOfMonth)
                    {
                        if (tmpl.Type == "income") projMonthIncome += tmpl.Amount;
                        else projMonthExpenses += tmpl.Amount;
                    }
                    if (next.Year == year)
                    {
                        if (tmpl.Type == "income") projYearIncome += tmpl.Amount;
                        else projYearExpenses += tmpl.Amount;
                    }
                }
                next = tmpl.Frequency switch
                {
                    RecurringFrequency.Daily   => next.AddDays(1),
                    RecurringFrequency.Weekly  => next.AddDays(7),
                    RecurringFrequency.Monthly => next.AddMonths(1),
                    RecurringFrequency.Yearly  => next.AddYears(1),
                    _ => endOfYear.AddDays(1)
                };
            }
        }

        return Ok(new
        {
            month = new { income = projMonthIncome, expenses = projMonthExpenses, balance = projMonthIncome - projMonthExpenses },
            year  = new { income = projYearIncome,  expenses = projYearExpenses,  balance = projYearIncome  - projYearExpenses  }
        });
    }

    [HttpGet("templates")]
    public async Task<IActionResult> GetTemplates()
    {
        var templates = await db.Transactions
            .Include(t => t.Category)
            .Where(t => t.UserId == UserId && t.IsRecurring)
            .OrderBy(t => t.NextOccurrence)
            .ToListAsync();
        return Ok(templates);
    }

    [HttpPost("{id}/stop-recurrence")]
    public async Task<IActionResult> StopRecurrence(int id)
    {
        var t = await db.Transactions.FirstOrDefaultAsync(t => t.Id == id && t.UserId == UserId);
        if (t is null) return NotFound();
        t.IsRecurring = false;
        t.Frequency = null;
        t.NextOccurrence = null;
        await db.SaveChangesAsync();
        return Ok(t);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var t = await db.Transactions.FirstOrDefaultAsync(t => t.Id == id && t.UserId == UserId);
        if (t is null) return NotFound();
        db.Transactions.Remove(t);
        await db.SaveChangesAsync();
        return NoContent();
    }

    public record TransactionRequest(decimal Amount, string Type, string Description, DateTime? Date, string? Notes, int? CategoryId, bool IsRecurring = false, RecurringFrequency? Frequency = null, DateTime? NextOccurrence = null);
}
