using Microsoft.AspNetCore.Mvc;
using Knightime_FFL_API.Models;
using Microsoft.EntityFrameworkCore;

namespace Knightime_FFL_API.Controllers;

[ApiController]
[Route("[controller]")]
public class LeagueMembersController : ControllerBase
{
    private readonly AppDbContext _context;

    public LeagueMembersController(
        AppDbContext context
        )
    {
        _context = context;
    }

    [HttpGet("")]
    public async Task<IActionResult> GetLeagueMembers()
    {
        var leagueMembers = await _context.LeagueMembers.ToListAsync();

        if (!leagueMembers.Any())
        {
            return NotFound("No league members found");
        }
        
        return Ok(leagueMembers);
    }

    [HttpGet("id/{id}")]
    public async Task<IActionResult> GetLeagueMemberById(int id)
    {
        var leagueMember = await _context.LeagueMembers.FirstOrDefaultAsync(m => m.Id == id);
        
        if (leagueMember == null)
        {
            return NotFound($"League member with ID {id} not found");
        }

        return Ok(leagueMember);
    }

    [HttpGet("name/{name}")]
    public async Task<IActionResult> GetLeagueMemberByName(string name)
    {
        var leagueMembers = await _context.LeagueMembers
            .Where(m => m.LeagueMember != null && m.LeagueMember.Contains(name, StringComparison.OrdinalIgnoreCase))
            .ToListAsync();

        if (!leagueMembers.Any())
        {
            return NotFound($"No league members found with name containing '{name}'");
        }

        return Ok(leagueMembers);
    }
}
