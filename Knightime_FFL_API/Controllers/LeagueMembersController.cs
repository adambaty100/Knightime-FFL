using Microsoft.AspNetCore.Mvc;
using Knightime_FFL_API.Models;
using Microsoft.EntityFrameworkCore;

namespace Knightime_FFL_API.Controllers;

[ApiController]
[Route("[controller]")]
public class LeagueMembersController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<LeagueMembersController> _logger;

    public LeagueMembersController(
        AppDbContext context,
        ILogger<LeagueMembersController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet()]
    public async Task<IActionResult> GetLeagueMembers()
    {
        var leagueMembers = await _context.LeagueMembers.ToListAsync();
        return Ok(leagueMembers);
    }
}
