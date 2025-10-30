using System;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace Knightime_FFL_API.Models;

public class LeagueMembers
{
    [Column("id")]
    public int Id { get; set; }

    [Column("league_member")]
    public string? LeagueMember { get; set; }

    [Column("experience")]
    public int Experience { get; set; }
}
