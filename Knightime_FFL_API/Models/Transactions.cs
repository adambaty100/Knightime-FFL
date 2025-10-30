using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace Knightime_FFL_API.Models;

public class Transactions
{
    [Column("rowid")]
    public long Id { get; set; }

    [Column("league_member_id")]
    public int LeagueMemberId { get; set; }

    [Column("trades")]
    public int Trades { get; set; }

    [Column("acquisitions")]
    public int Acquisitions { get; set; }

    [Column("drops")]
    public int Drops { get; set; }

    [Column("activations")]
    public int Activations { get; set; }

    [Column("ir")]
    public int IR { get; set; }

    [Column("year")]
    public int Year { get; set; }
}
