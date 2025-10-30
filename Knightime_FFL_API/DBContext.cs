using Knightime_FFL_API.Models;
using Microsoft.EntityFrameworkCore;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<LeagueMembers> LeagueMembers { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<LeagueMembers>()
            .ToTable("League_Members");

        modelBuilder.Entity<LeagueMembers>()
            .HasKey(lm => lm.Id);
    }
}
