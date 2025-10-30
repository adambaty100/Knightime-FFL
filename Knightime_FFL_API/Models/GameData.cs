using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace Knightime_FFL_API.Models;

public class GameData
{
    [Column("rowid")]
    public long Id { get; set; }

    [Column("league_member_id")]
    public int LeagueMemberId { get; set; }

    [Column("points_for")]
    public int PointsFor { get; set; }

    [Column("points_against")]
    public int PointsAgainst { get; set; }

    [Column("win_loss_tie")]
    public string? WinLossTie { get; set; }

    [Column("opponent_id")]
    public int OpponentId { get; set; }

    [Column("year")]
    public int Year { get; set; }

    [Column("week")]
    public int Week { get; set; }
}
