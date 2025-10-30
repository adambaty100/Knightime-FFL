using System;
using System.ComponentModel.DataAnnotations.Schema;
using System.Runtime.CompilerServices;

namespace Knightime_FFL_API.Models;

public class TeamData
{
    [Column("rowid")]
    public long Id { get; set; }
    
    [Column("year")]
    public int Year { get; set; }

    [Column("league_member_id")]
    public int LeagueMemberId { get; set; }

    [Column("team_name")]
    public string? TeamName { get; set; }
}
