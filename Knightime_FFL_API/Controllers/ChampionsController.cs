using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Knightime_FFL_API.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class ChampionsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ChampionsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("")]
        public async Task<IActionResult> GetChampions()
        {
            var champions = await _context.Champions.ToListAsync();

            if (!champions.Any())
            {
                return NotFound("No champions found");
            }

            return Ok(champions);
        }

        [HttpGet("year/{year}")]
        public async Task<IActionResult> GetChampionByYear(int year)
        {
            var champions = await _context.Champions
                .Where(c => c.Year == year)
                .ToListAsync();

            if (!champions.Any())
            {
                return NotFound($"No champions found for year {year}");
            }

            return Ok(champions);
        }

        [HttpGet("member/{leagueMemberId}")]
        public async Task<IActionResult> GetChampionshipsByLeagueMember(int leagueMemberId)
        {
            var championships = await _context.Champions
                .Where(c => c.LeagueMemberId == leagueMemberId)
                .ToListAsync();

            if (!championships.Any())
            {
                return NotFound($"No championships found for league member ID {leagueMemberId}");
            }

            return Ok(championships);
        }
    }
}
