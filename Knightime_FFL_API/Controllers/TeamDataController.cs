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
        private readonly ILogger<TeamDataController> _logger;

        public TeamDataController(
            AppDbContext context,
            ILogger<TeamDataController> logger
        )
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet("")]
        public async Task<IActionResult> GetTeamData()
        {
            var teamData = await _context.TeamData.ToListAsync();
            return Ok(teamData);
        }
    }
}
