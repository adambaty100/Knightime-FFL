import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';

interface TeamRecord {
  rank: number;
  name: string;
  avatar: string;
  leagueMemberId?: number;
  leagueMemberName?: string;
  wins: number;
  losses: number;
  winPercentage: string;
  pointsFor: string;
  pointsAgainst: string;
  championships: number;
  isChampion: boolean;
  status: {
    text: string;
    type: 'champion' | 'playoff';
  };
}

interface TeamData {
  id: number;
  year: number;
  leagueMemberId: number;
  teamName: string;
}

interface LeagueMember {
  id: number;
  leagueMember: string;
  experience: number;
}

interface GameData {
  id: number;
  leagueMemberId: number;
  pointsFor: number;
  pointsAgainst: number;
  winLossTie: string;
  opponentId: number;
  year: number;
  week: string;
}

interface GameStats {
  wins: number;
  losses: number;
  ties: number;
  pointsFor: number;
  pointsAgainst: number;
}

interface Champion {
  id: number;
  leagueMemberId: number;
  year: number;
}

@Component({
  selector: 'app-team-records',
  imports: [CommonModule],
  templateUrl: './team-records.html',
  styleUrl: './team-records.css'
})
export class TeamRecordsComponent implements OnInit {
  teams: TeamRecord[] = [];
  rawTeamData: TeamData[] = [];
  rawGameData: GameData[] = [];
  rawChampionsData: Champion[] = [];
  activeFilter: string = 'All Time';
  availableYears: number[] = [];
  isLoading: boolean = true;
  error: string | null = null;
  sortColumn: string = 'rank';
  sortDirection: 'asc' | 'desc' = 'asc';

  private apiUrl = 'https://localhost:44372/teamdata';
  private gameDataUrl = 'https://localhost:44372/gamedata';
  private championsUrl = 'https://localhost:44372/champions';
  private leagueMembersUrl = 'https://localhost:44372/leaguemembers/id';
  private leagueMemberCache = new Map<number, string>();
  private championsCache = new Map<number, Set<number>>();

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.error = null;

    // Fetch team data, game data, and champions data in parallel
    forkJoin([
      this.http.get<TeamData[]>(this.apiUrl),
      this.http.get<GameData[]>(this.gameDataUrl),
      this.http.get<Champion[]>(this.championsUrl)
    ]).subscribe({
      next: ([teamData, gameData, championsData]) => {
        this.rawTeamData = teamData;
        this.rawGameData = gameData;
        this.rawChampionsData = championsData;
        this.buildChampionsCache();
        this.extractAvailableYears();
        this.processTeamData();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading data:', err);
        this.error = 'Failed to load data. Please try again later.';
        this.isLoading = false;
        this.loadMockData();
      }
    });
  }

  private extractAvailableYears(): void {
    // Extract unique years from data and sort in descending order
    const years = new Set(this.rawTeamData.map(team => team.year));
    this.availableYears = Array.from(years).sort((a, b) => b - a);
  }

  private buildChampionsCache(): void {
    // Build a map of year -> Set<leagueMemberId> for quick lookup
    this.rawChampionsData.forEach(champion => {
      if (!this.championsCache.has(champion.year)) {
        this.championsCache.set(champion.year, new Set<number>());
      }
      this.championsCache.get(champion.year)!.add(champion.leagueMemberId);
    });
  }

  private isChampionInYear(leagueMemberId: number, year: number): boolean {
    const championsForYear = this.championsCache.get(year);
    return championsForYear ? championsForYear.has(leagueMemberId) : false;
  }

  private processTeamData(): void {
    if (this.activeFilter === 'All Time') {
      this.processAllTimeData();
    } else {
      this.processYearData(parseInt(this.activeFilter));
    }
  }

  private processAllTimeData(): void {
    // Group by league member ID (unique per person)
    const leagueMemberMap = new Map<number, any>();

    // Sort rawTeamData by year descending to get the most recent first
    const sortedByYear = [...this.rawTeamData].sort((a, b) => b.year - a.year);

    // Get the most recent year overall in the dataset
    const mostRecentYearOverall = sortedByYear.length > 0 ? sortedByYear[0].year : 0;

    sortedByYear.forEach(team => {
      const memberId = team.leagueMemberId;
      if (!leagueMemberMap.has(memberId)) {
        // First occurrence is the most recent
        leagueMemberMap.set(memberId, {
          leagueMemberId: memberId,
          teamName: team.teamName,
          years: [team.year],
          mostRecentYear: team.year
        });
      } else {
        const existing = leagueMemberMap.get(memberId);
        if (!existing.years.includes(team.year)) {
          existing.years.push(team.year);
        }
      }
    });

    // Convert to array and sort by team name
    const teams = Array.from(leagueMemberMap.values())
      .sort((a, b) => a.teamName.localeCompare(b.teamName))
      .map((team, index) => {
        const initials = this.getInitials(team.teamName);
        const stats = this.calculateStatsForMember(team.leagueMemberId);
        
        // Count total championships from the champions data
        const totalChampionships = this.rawChampionsData.filter(
          c => c.leagueMemberId === team.leagueMemberId
        ).length;
        
        // Check if this member was active in the most recent year overall
        const isActiveInMostRecentYear = team.mostRecentYear === mostRecentYearOverall;
        
        return {
          rank: index + 1,
          name: team.teamName,
          avatar: initials,
          leagueMemberId: team.leagueMemberId,
          leagueMemberName: '',
          wins: stats.wins,
          losses: stats.losses,
          winPercentage: this.calculateWinPercentage(stats.wins, stats.losses),
          pointsFor: stats.pointsFor.toLocaleString(),
          pointsAgainst: stats.pointsAgainst.toLocaleString(),
          championships: totalChampionships,
          isChampion: false,
          status: {
            text: isActiveInMostRecentYear ? 'Active' : 'Inactive',
            type: 'playoff' as const
          }
        };
      });

    // Fetch league member names for all teams
    this.fetchLeagueMemberNames(teams);
  }

  private fetchLeagueMemberNames(teams: TeamRecord[]): void {
    // Get unique league member IDs that we haven't fetched yet
    const idsToFetch = teams
      .filter(team => team.leagueMemberId && !this.leagueMemberCache.has(team.leagueMemberId!))
      .map(team => team.leagueMemberId!);

    if (idsToFetch.length === 0) {
      // All names are cached, update display
      teams.forEach(team => {
        if (team.leagueMemberId && this.leagueMemberCache.has(team.leagueMemberId)) {
          team.leagueMemberName = this.leagueMemberCache.get(team.leagueMemberId);
        }
      });
      this.teams = teams;
      return;
    }

    // Fetch all league members in parallel
    const requests = idsToFetch.map(id =>
      this.http.get<LeagueMember>(`${this.leagueMembersUrl}/${id}`)
    );

    forkJoin(requests).subscribe({
      next: (members) => {
        // Cache the results
        members.forEach(member => {
          this.leagueMemberCache.set(member.id, member.leagueMember);
        });

        // Update teams with league member names
        teams.forEach(team => {
          if (team.leagueMemberId && this.leagueMemberCache.has(team.leagueMemberId)) {
            team.leagueMemberName = this.leagueMemberCache.get(team.leagueMemberId);
          }
        });
        this.teams = teams;
      },
      error: (err) => {
        console.error('Error fetching league member names:', err);
        // Still display teams even if we couldn't fetch league member names
        this.teams = teams;
      }
    });
  }

  private processYearData(year: number): void {
    // Filter teams for a specific year
    const yearTeams = this.rawTeamData.filter(team => team.year === year);

    const teams = yearTeams
      .sort((a, b) => a.teamName.localeCompare(b.teamName))
      .map((team, index) => {
        const initials = this.getInitials(team.teamName);
        const stats = this.calculateStatsForMember(team.leagueMemberId, year);
        const isChampion = this.isChampionInYear(team.leagueMemberId, year);
        
        return {
          rank: index + 1,
          name: team.teamName,
          avatar: initials,
          leagueMemberId: team.leagueMemberId,
          leagueMemberName: '',
          wins: stats.wins,
          losses: stats.losses,
          winPercentage: this.calculateWinPercentage(stats.wins, stats.losses),
          pointsFor: stats.pointsFor.toLocaleString(),
          pointsAgainst: stats.pointsAgainst.toLocaleString(),
          championships: 0,
          isChampion: isChampion,
          status: {
            text: isChampion ? 'Champion' : 'Active',
            type: isChampion ? 'champion' as const : 'playoff' as const
          }
        };
      });

    // Fetch league member names for all teams
    this.fetchLeagueMemberNames(teams);
  }

  private calculateStatsForMember(leagueMemberId: number, year?: number): GameStats {
    let games = this.rawGameData.filter(g => g.leagueMemberId === leagueMemberId);
    
    // Filter by year if provided
    if (year !== undefined) {
      games = games.filter(g => g.year === year);
    }

    let wins = 0;
    let losses = 0;
    let ties = 0;
    let pointsFor = 0;
    let pointsAgainst = 0;

    games.forEach(game => {
      pointsFor += game.pointsFor;
      pointsAgainst += game.pointsAgainst;

      if (game.winLossTie?.toUpperCase() === 'W') {
        wins++;
      } else if (game.winLossTie?.toUpperCase() === 'L') {
        losses++;
      } else if (game.winLossTie?.toUpperCase() === 'T') {
        ties++;
      }
    });

    console.debug(`Stats for memberId ${leagueMemberId} (year ${year}):`, { wins, losses, ties, pointsFor, pointsAgainst, gameCount: games.length });

    return { wins, losses, ties, pointsFor, pointsAgainst };
  }

  private calculateWinPercentage(wins: number, losses: number): string {
    const totalGames = wins + losses;
    if (totalGames === 0) {
      return '0%';
    }
    const percentage = (wins / totalGames * 100).toFixed(1);
    return `${percentage}%`;
  }

  private getInitials(name: string): string {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2);
  }

  private loadMockData(): void {
    this.availableYears = [2024, 2023, 2022];
    this.teams = [
      {
        rank: 1,
        name: "John's Destroyers",
        avatar: 'JD',
        leagueMemberId: 1,
        leagueMemberName: 'John Doe',
        wins: 87,
        losses: 45,
        winPercentage: '65.9%',
        pointsFor: '13,247',
        pointsAgainst: '12,500',
        championships: 2,
        isChampion: true,
        status: { text: "Champion '23", type: 'champion' }
      },
      {
        rank: 2,
        name: "Mike's Kings",
        avatar: 'MK',
        leagueMemberId: 2,
        leagueMemberName: 'Mike Smith',
        wins: 81,
        losses: 51,
        winPercentage: '61.4%',
        pointsFor: '12,895',
        pointsAgainst: '13,100',
        championships: 3,
        isChampion: false,
        status: { text: 'Playoff', type: 'playoff' }
      },
      {
        rank: 3,
        name: "Sarah's Aces",
        avatar: 'SA',
        leagueMemberId: 3,
        leagueMemberName: 'Sarah Johnson',
        wins: 79,
        losses: 53,
        winPercentage: '59.8%',
        pointsFor: '12,654',
        pointsAgainst: '12,800',
        championships: 1,
        isChampion: false,
        status: { text: 'Playoff', type: 'playoff' }
      },
      {
        rank: 4,
        name: "Ryan's Warriors",
        avatar: 'RW',
        leagueMemberId: 4,
        leagueMemberName: 'Ryan Williams',
        wins: 75,
        losses: 57,
        winPercentage: '56.8%',
        pointsFor: '12,321',
        pointsAgainst: '13,200',
        championships: 1,
        isChampion: false,
        status: { text: 'Playoff', type: 'playoff' }
      },
      {
        rank: 5,
        name: "Laura's Crusaders",
        avatar: 'LC',
        leagueMemberId: 5,
        leagueMemberName: 'Laura Brown',
        wins: 71,
        losses: 61,
        winPercentage: '53.8%',
        pointsFor: '11,987',
        pointsAgainst: '12,600',
        championships: 1,
        isChampion: false,
        status: { text: 'Playoff', type: 'playoff' }
      }
    ];
  }

  onFilterClick(filter: string): void {
    this.activeFilter = filter;
    this.sortColumn = 'rank';
    this.sortDirection = 'asc';
    this.processTeamData();
  }

  onSort(column: string): void {
    if (this.sortColumn === column) {
      // Toggle sort direction if clicking the same column
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // Set new sort column and reset direction to ascending
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.sortTeams();
  }

  private sortTeams(): void {
    const teamsToSort = [...this.teams];

    teamsToSort.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (this.sortColumn) {
        case 'rank':
          aValue = a.rank;
          bValue = b.rank;
          break;
        case 'team':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'leagueMember':
          aValue = a.leagueMemberName || '';
          bValue = b.leagueMemberName || '';
          break;
        case 'wins':
          aValue = a.wins;
          bValue = b.wins;
          break;
        case 'losses':
          aValue = a.losses;
          bValue = b.losses;
          break;
        case 'winPercentage':
          aValue = parseFloat(a.winPercentage);
          bValue = parseFloat(b.winPercentage);
          break;
        case 'pointsFor':
          aValue = parseInt(a.pointsFor.replace(/,/g, ''));
          bValue = parseInt(b.pointsFor.replace(/,/g, ''));
          break;
        case 'pointsAgainst':
          aValue = parseInt(a.pointsAgainst.replace(/,/g, ''));
          bValue = parseInt(b.pointsAgainst.replace(/,/g, ''));
          break;
        case 'championships':
          aValue = a.championships;
          bValue = b.championships;
          break;
        case 'status':
          aValue = a.status.text;
          bValue = b.status.text;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) {
        return this.sortDirection === 'asc' ? -1 : 1;
      } else if (aValue > bValue) {
        return this.sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });

    this.teams = teamsToSort;
  }
}
