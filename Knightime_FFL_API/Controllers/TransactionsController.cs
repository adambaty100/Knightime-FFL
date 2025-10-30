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
        private readonly ILogger<TransactionsController> _logger;

        public TransactionsController(
            AppDbContext context,
            ILogger<TransactionsController> logger
        )
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet("")]
        public async Task<IActionResult> GetTransactions()
        {
            var transactions = await _context.Transactions.ToListAsync();
            return Ok(transactions);
        }
    }
}
