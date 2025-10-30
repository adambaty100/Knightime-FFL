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
        private readonly ILogger<GameDataController> _logger;

        public GameDataController(
            AppDbContext context,
            ILogger<GameDataController> logger
        )
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet("")]
        public async Task<IActionResult> GetGameData()
        {
            var gameData = await _context.GameData.ToListAsync();
            return Ok(gameData);
        }
    }
}
