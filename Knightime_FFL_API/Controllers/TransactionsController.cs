using Knightime_FFL_API.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Knightime_FFL_API.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class TransactionsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TransactionsController(
            AppDbContext context
        )
        {
            _context = context;
        }

        [HttpGet("")]
        public async Task<IActionResult> GetTransactions()
        {
            var transactions = await _context.Transactions.ToListAsync();

            if (!transactions.Any())
            {
                return NotFound("No transactions found");
            }

            return Ok(transactions);
        }

        [HttpGet("id/{id}")]
        public async Task<IActionResult> GetTransactionById(long id)
        {
            var transaction = await _context.Transactions.FirstOrDefaultAsync(t => t.Id == id);
            
            if (transaction == null)
            {
                return NotFound($"Transaction with ID {id} not found");
            }

            return Ok(transaction);
        }

        [HttpGet("member/{leagueMemberId}")]
        public async Task<IActionResult> GetTransactionsByLeagueMemberId(int leagueMemberId)
        {
            var transactions = await _context.Transactions
                .Where(t => t.LeagueMemberId == leagueMemberId)
                .ToListAsync();

            if (!transactions.Any())
            {
                return NotFound($"No transactions found for league member ID {leagueMemberId}");
            }

            return Ok(transactions);
        }

        [HttpGet("year/{year}")]
        public async Task<IActionResult> GetTransactionsByYear(int year)
        {
            var transactions = await _context.Transactions
                .Where(t => t.Year == year)
                .ToListAsync();

            if (!transactions.Any())
            {
                return NotFound($"No transactions found for year {year}");
            }

            return Ok(transactions);
        }

        [HttpPost("")]
        public async Task<IActionResult> CreateTransaction([FromBody] Transactions transaction)
        {
            if (transaction == null)
            {
                return BadRequest("Transaction data is required");
            }

            _context.Transactions.Add(transaction);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetTransactionById), new { id = transaction.Id }, transaction);
        }

        [HttpPatch("id/{id}")]
        public async Task<IActionResult> UpdateTransaction(long id, [FromBody] Transactions transaction)
        {
            if (transaction == null)
            {
                return BadRequest("Transaction data is required");
            }

            var existingTransaction = await _context.Transactions.FirstOrDefaultAsync(t => t.Id == id);

            if (existingTransaction == null)
            {
                return NotFound($"Transaction with ID {id} not found");
            }

            existingTransaction.LeagueMemberId = transaction.LeagueMemberId;
            existingTransaction.Trades = transaction.Trades;
            existingTransaction.Acquisitions = transaction.Acquisitions;
            existingTransaction.Drops = transaction.Drops;
            existingTransaction.Activations = transaction.Activations;
            existingTransaction.IR = transaction.IR;
            existingTransaction.Year = transaction.Year;

            _context.Transactions.Update(existingTransaction);
            await _context.SaveChangesAsync();

            return Ok(existingTransaction);
        }

        [HttpDelete("id/{id}")]
        public async Task<IActionResult> DeleteTransaction(long id)
        {
            var transaction = await _context.Transactions.FirstOrDefaultAsync(t => t.Id == id);

            if (transaction == null)
            {
                return NotFound($"Transaction with ID {id} not found");
            }

            _context.Transactions.Remove(transaction);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
