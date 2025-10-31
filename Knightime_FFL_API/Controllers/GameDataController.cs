using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Knightime_FFL_API.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class GameDataController : ControllerBase
    {
        private readonly AppDbContext _context;

        public GameDataController(
            AppDbContext context
        )
        {
            _context = context;
        }

        [HttpGet("")]
        public async Task<IActionResult> GetGameData()
        {
            var gameData = await _context.GameData.ToListAsync();
            return Ok(gameData);
        }

        [HttpGet("id/{id}")]
        public async Task<IActionResult> GetGameDataById(long id)
        {
            var gameData = await _context.GameData.FirstOrDefaultAsync(g => g.Id == id);
            
            if (gameData == null)
            {
                return NotFound($"Game data with ID {id} not found");
            }

            return Ok(gameData);
        }

        [HttpGet("week/{week}")]
        public async Task<IActionResult> GetGameDataByWeek(string week)
        {
            var gameData = await _context.GameData
                .Where(g => g.Week == week)
                .ToListAsync();

            if (!gameData.Any())
            {
                return NotFound($"No game data found for week {week}");
            }

            return Ok(gameData);
        }

        [HttpGet("year/{year}")]
        public async Task<IActionResult> GetGameDataByYear(int year)
        {
            var gameData = await _context.GameData
                .Where(g => g.Year == year)
                .ToListAsync();

            if (!gameData.Any())
            {
                return NotFound($"No game data found for year {year}");
            }

            return Ok(gameData);
        }

        [HttpGet("member/{leagueMemberId}")]
        public async Task<IActionResult> GetGameDataByLeagueMemberId(int leagueMemberId)
        {
            var gameData = await _context.GameData
                .Where(g => g.LeagueMemberId == leagueMemberId)
                .ToListAsync();

            if (!gameData.Any())
            {
                return NotFound($"No game data found for league member ID {leagueMemberId}");
            }

            return Ok(gameData);
        }
    }
}
