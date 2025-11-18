import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';

interface TeamData {
  id: number;
  year: number;
  leagueMemberId: number;
  teamName: string;
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

interface LeagueMember {
  id: number;
  leagueMember: string;
  experience: number;
}

interface GameRecord {
  week: string;
  result: string;
  pointsFor: number;
  pointsAgainst: number;
  opponent: string;
}

interface LeagueMemberTeam {
  leagueMemberId: number;
  name: string;
  years: number[];
}

@Component({
  selector: 'app-game-data',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game-data.html',
  styleUrl: './game-data.css'
})
export class GameDataComponent implements OnInit {
  leagueMemberTeams: LeagueMemberTeam[] = [];
  rawGameData: GameData[] = [];
  selectedMemberId: number | null = null;
  selectedYear: number | null = null;
  availableYears: number[] = [];
  gameRecords: GameRecord[] = [];
  
  isLoading: boolean = true;
  error: string | null = null;

  private apiUrl = 'https://localhost:44372';
  private leagueMemberCache = new Map<number, string>();
  private teamDataMap = new Map<number, TeamData[]>();

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.error = null;

    forkJoin([
      this.http.get<TeamData[]>(`${this.apiUrl}/teamdata`),
      this.http.get<GameData[]>(`${this.apiUrl}/gamedata`)
    ]).subscribe({
      next: ([teamData, gameData]) => {
        this.rawGameData = gameData;
        this.buildLeagueMemberTeams(teamData);
        this.extractAvailableYears();
        this.fetchLeagueMemberNames();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading game data:', err);
        this.error = 'Failed to load game data';
        this.isLoading = false;
      }
    });
  }

  private buildLeagueMemberTeams(teamData: TeamData[]): void {
    const memberMap = new Map<number, Set<number>>();

    // Group years by league member
    teamData.forEach(team => {
      if (!memberMap.has(team.leagueMemberId)) {
        memberMap.set(team.leagueMemberId, new Set<number>());
      }
      memberMap.get(team.leagueMemberId)!.add(team.year);
      
      // Store team data for lookups
      if (!this.teamDataMap.has(team.leagueMemberId)) {
        this.teamDataMap.set(team.leagueMemberId, []);
      }
      this.teamDataMap.get(team.leagueMemberId)!.push(team);
    });

    // Convert to array (will populate names later)
    this.leagueMemberTeams = Array.from(memberMap.entries()).map(([memberId, years]) => ({
      leagueMemberId: memberId,
      name: '',
      years: Array.from(years).sort((a, b) => b - a)
    }));
  }

  private extractAvailableYears(): void {
    const years = new Set(this.rawGameData.map(game => game.year));
    this.availableYears = Array.from(years).sort((a, b) => b - a);
  }

  private fetchLeagueMemberNames(): void {
    const memberIds = this.leagueMemberTeams.map(m => m.leagueMemberId);
    const idsToFetch = memberIds.filter(id => !this.leagueMemberCache.has(id));

    if (idsToFetch.length === 0) {
      this.updateMemberNames();
      return;
    }

    const requests = idsToFetch.map(id =>
      this.http.get<LeagueMember>(`${this.apiUrl}/leaguemembers/id/${id}`)
    );

    forkJoin(requests).subscribe({
      next: (members) => {
        members.forEach(member => {
          this.leagueMemberCache.set(member.id, member.leagueMember);
        });
        this.updateMemberNames();
      },
      error: (err) => {
        console.error('Error fetching league member names:', err);
        this.updateMemberNames();
      }
    });
  }

  private updateMemberNames(): void {
    this.leagueMemberTeams.forEach(member => {
      member.name = this.leagueMemberCache.get(member.leagueMemberId) || 'Unknown';
    });
    // Sort by name
    this.leagueMemberTeams.sort((a, b) => a.name.localeCompare(b.name));
  }

  onMemberSelect(memberId: number): void {
    this.selectedMemberId = memberId;
    this.selectedYear = null;
    this.gameRecords = [];
  }

  onYearSelect(year: number): void {
    this.selectedYear = year;
    this.loadGameRecords();
  }

  private loadGameRecords(): void {
    if (!this.selectedMemberId || !this.selectedYear) {
      return;
    }

    const memberGames = this.rawGameData.filter(
      game => game.leagueMemberId === this.selectedMemberId && game.year === this.selectedYear
    );

    this.gameRecords = memberGames
      .sort((a, b) => {
        // Extract week number for regular weeks
        const weekAMatch = a.week.match(/^(\d+)$/);
        const weekBMatch = b.week.match(/^(\d+)$/);
        
        // Check if they are Rd (round) games
        const isRdA = a.week.toLowerCase().startsWith('rd');
        const isRdB = b.week.toLowerCase().startsWith('rd');

        // If both are regular weeks, sort numerically
        if (weekAMatch && weekBMatch) {
          return parseInt(weekAMatch[1]) - parseInt(weekBMatch[1]);
        }

        // If one is Rd and other is a week, weeks come first
        if (isRdA && !isRdB) return 1;
        if (!isRdA && isRdB) return -1;

        // If both are Rd games, sort by the number after "Rd"
        if (isRdA && isRdB) {
          const rdAMatch = a.week.match(/rd\s*(\d+)/i);
          const rdBMatch = b.week.match(/rd\s*(\d+)/i);
          const rdANum = rdAMatch ? parseInt(rdAMatch[1]) : 0;
          const rdBNum = rdBMatch ? parseInt(rdBMatch[1]) : 0;
          return rdANum - rdBNum;
        }

        // Fallback to string comparison
        return a.week.localeCompare(b.week);
      })
      .map(game => ({
        week: game.week,
        result: game.winLossTie,
        pointsFor: game.pointsFor,
        pointsAgainst: game.pointsAgainst,
        opponent: this.getOpponentName(game.opponentId, this.selectedYear!)
      }));
  }

  private getOpponentName(opponentId: number, year: number): string {
    const opponentTeams = this.teamDataMap.get(opponentId);
    if (opponentTeams) {
      const opponentTeam = opponentTeams.find(t => t.year === year);
      if (opponentTeam && this.leagueMemberCache.has(opponentId)) {
        return this.leagueMemberCache.get(opponentId) || 'Unknown';
      }
    }
    return 'Unknown';
  }

  getMemberName(memberId: number): string {
    return this.leagueMemberCache.get(memberId) || 'Unknown';
  }

  getResultClass(result: string): string {
    const upper = result.toUpperCase();
    if (upper === 'W') return 'win';
    if (upper === 'L') return 'loss';
    if (upper === 'T') return 'tie';
    return '';
  }
}
