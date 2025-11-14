using System.ComponentModel.DataAnnotations.Schema;

namespace Knightime_FFL_API.Models;

public class Champions
{
    [Column("rowid")]
    public long Id { get; set; }

    [Column("league_member_id")]
    public int LeagueMemberId { get; set; }

    [Column("year")]
    public int Year { get; set; }
}
