using Knightime_FFL_API.Models;
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

        [HttpPost("")]
        public async Task<IActionResult> CreateChampion([FromBody] Champions champion)
        {
            if (champion == null)
            {
                return BadRequest("Champion data is required");
            }

            _context.Champions.Add(champion);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetChampions), new { id = champion.Id }, champion);
        }

        [HttpPatch("id/{id}")]
        public async Task<IActionResult> UpdateChampion(long id, [FromBody] Champions champion)
        {
            if (champion == null)
            {
                return BadRequest("Champion data is required");
            }

            var existingChampion = await _context.Champions.FirstOrDefaultAsync(c => c.Id == id);

            if (existingChampion == null)
            {
                return NotFound($"Champion with ID {id} not found");
            }

            existingChampion.LeagueMemberId = champion.LeagueMemberId;
            existingChampion.Year = champion.Year;

            _context.Champions.Update(existingChampion);
            await _context.SaveChangesAsync();

            return Ok(existingChampion);
        }

        [HttpDelete("id/{id}")]
        public async Task<IActionResult> DeleteChampion(long id)
        {
            var champion = await _context.Champions.FirstOrDefaultAsync(c => c.Id == id);

            if (champion == null)
            {
                return NotFound($"Champion with ID {id} not found");
            }

            _context.Champions.Remove(champion);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
