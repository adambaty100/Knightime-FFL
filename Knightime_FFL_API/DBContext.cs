using Knightime_FFL_API.Models;
using Microsoft.EntityFrameworkCore;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<LeagueMembers> LeagueMembers { get; set; } = null!;
    public DbSet<TeamData> TeamData { get; set; } = null!;
    public DbSet<Transactions> Transactions { get; set; } = null!;
    public DbSet<GameData> GameData { get; set; } = null!;
    public DbSet<Champions> Champions { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<LeagueMembers>()
            .ToTable("League_Members");

        modelBuilder.Entity<TeamData>()
            .ToTable("Team_Data");

        modelBuilder.Entity<Transactions>()
            .ToTable("Transactions");

        modelBuilder.Entity<GameData>()
            .ToTable("Game_Data");

        modelBuilder.Entity<Champions>()
            .ToTable("Champions");
    }
}
