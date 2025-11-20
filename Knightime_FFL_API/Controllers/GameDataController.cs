using Knightime_FFL_API.Models;
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

            if (!gameData.Any())
            {
                return NotFound("No game data found");
            }
            
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

        [HttpPost("")]
        public async Task<IActionResult> CreateGameData([FromBody] GameData gameData)
        {
            if (gameData == null)
            {
                return BadRequest("Game data is required");
            }

            _context.GameData.Add(gameData);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetGameDataById), new { id = gameData.Id }, gameData);
        }

        [HttpPatch("id/{id}")]
        public async Task<IActionResult> UpdateGameData(long id, [FromBody] GameData gameData)
        {
            if (gameData == null)
            {
                return BadRequest("Game data is required");
            }

            var existingGameData = await _context.GameData.FirstOrDefaultAsync(g => g.Id == id);

            if (existingGameData == null)
            {
                return NotFound($"Game data with ID {id} not found");
            }

            existingGameData.LeagueMemberId = gameData.LeagueMemberId;
            existingGameData.PointsFor = gameData.PointsFor;
            existingGameData.PointsAgainst = gameData.PointsAgainst;
            existingGameData.WinLossTie = gameData.WinLossTie;
            existingGameData.OpponentId = gameData.OpponentId;
            existingGameData.Year = gameData.Year;
            existingGameData.Week = gameData.Week;

            _context.GameData.Update(existingGameData);
            await _context.SaveChangesAsync();

            return Ok(existingGameData);
        }

        [HttpDelete("id/{id}")]
        public async Task<IActionResult> DeleteGameData(long id)
        {
            var gameData = await _context.GameData.FirstOrDefaultAsync(g => g.Id == id);

            if (gameData == null)
            {
                return NotFound($"Game data with ID {id} not found");
            }

            _context.GameData.Remove(gameData);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
