using Knightime_FFL_API.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Knightime_FFL_API.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class TeamDataController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TeamDataController(
            AppDbContext context
        )
        {
            _context = context;
        }

        [HttpGet("")]
        public async Task<IActionResult> GetTeamData()
        {
            var teamData = await _context.TeamData.ToListAsync();

            if (!teamData.Any())
            {
                return NotFound("No team data found");
            }
            
            return Ok(teamData);
        }

        [HttpGet("id/{id}")]
        public async Task<IActionResult> GetTeamDataById(long id)
        {
            var teamData = await _context.TeamData.FirstOrDefaultAsync(t => t.Id == id);
            
            if (teamData == null)
            {
                return NotFound($"Team data with ID {id} not found");
            }

            return Ok(teamData);
        }

        [HttpGet("year/{year}")]
        public async Task<IActionResult> GetTeamDataByYear(int year)
        {
            var teamData = await _context.TeamData
                .Where(t => t.Year == year)
                .ToListAsync();

            if (!teamData.Any())
            {
                return NotFound($"No team data found for year {year}");
            }

            return Ok(teamData);
        }

        [HttpGet("member/{leagueMemberId}")]
        public async Task<IActionResult> GetTeamDataByLeagueMemberId(int leagueMemberId)
        {
            var teamData = await _context.TeamData
                .Where(t => t.LeagueMemberId == leagueMemberId)
                .ToListAsync();

            if (!teamData.Any())
            {
                return NotFound($"No team data found for league member ID {leagueMemberId}");
            }

            return Ok(teamData);
        }

        [HttpPost("")]
        public async Task<IActionResult> CreateTeamData([FromBody] TeamData teamData)
        {
            if (teamData == null)
            {
                return BadRequest("Team data is required");
            }

            _context.TeamData.Add(teamData);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetTeamDataById), new { id = teamData.Id }, teamData);
        }

        [HttpPatch("id/{id}")]
        public async Task<IActionResult> UpdateTeamData(long id, [FromBody] TeamData teamData)
        {
            if (teamData == null)
            {
                return BadRequest("Team data is required");
            }

            var existingTeamData = await _context.TeamData.FirstOrDefaultAsync(t => t.Id == id);

            if (existingTeamData == null)
            {
                return NotFound($"Team data with ID {id} not found");
            }

            existingTeamData.Year = teamData.Year;
            existingTeamData.LeagueMemberId = teamData.LeagueMemberId;
            existingTeamData.TeamName = teamData.TeamName;

            _context.TeamData.Update(existingTeamData);
            await _context.SaveChangesAsync();

            return Ok(existingTeamData);
        }

        [HttpDelete("id/{id}")]
        public async Task<IActionResult> DeleteTeamData(long id)
        {
            var teamData = await _context.TeamData.FirstOrDefaultAsync(t => t.Id == id);

            if (teamData == null)
            {
                return NotFound($"Team data with ID {id} not found");
            }

            _context.TeamData.Remove(teamData);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
