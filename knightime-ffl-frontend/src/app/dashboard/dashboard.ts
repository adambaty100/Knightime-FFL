import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { StatCardComponent } from '../stat-card/stat-card';

interface StatsData {
  totalTeams: number;
  totalGamesPlayed: number;
  totalChampionships: number;
  totalTransactions: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, StatCardComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {
  stats: StatsData = {
    totalTeams: 0,
    totalGamesPlayed: 0,
    totalChampionships: 0,
    totalTransactions: 0
  };
  isLoading: boolean = true;
  error: string | null = null;

  private apiUrl = 'https://localhost:44372';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.isLoading = true;
    this.error = null;

    forkJoin([
      this.http.get<any[]>(`${this.apiUrl}/teamdata`),
      this.http.get<any[]>(`${this.apiUrl}/gamedata`),
      this.http.get<any[]>(`${this.apiUrl}/champions`),
      this.http.get<any[]>(`${this.apiUrl}/transactions`)
    ]).subscribe({
      next: ([teamData, gameData, championsData, transactionsData]) => {
        const uniqueTeams = new Set(teamData.map((t: any) => t.leagueMemberId)).size;
        const totalGames = Math.round(gameData.length / 2); // Each game has two entries
        const totalChamps = championsData.length;
        
        // Calculate total transactions by summing all transaction types
        const totalTrans = transactionsData.reduce((sum: number, t: any) => {
          return sum + (t.trades || 0) + (t.acquisitions || 0) + (t.drops || 0) + (t.activations || 0) + (t.ir || 0);
        }, 0);

        console.log('Total games:', totalGames);
        console.log('Total Transactions:', totalTrans);

        console.log('Dashboard Stats:', { 
          totalTeams: uniqueTeams, 
          totalGamesPlayed: totalGames, 
          totalChampionships: totalChamps, 
          totalTransactions: totalTrans 
        });

        this.stats = {
          totalTeams: uniqueTeams,
          totalGamesPlayed: totalGames,
          totalChampionships: totalChamps,
          totalTransactions: totalTrans
        };
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading stats:', err);
        this.error = 'Failed to load statistics';
        this.isLoading = false;
        this.loadMockStats();
      }
    });
  }

  private loadMockStats(): void {
    this.stats = {
      totalTeams: 12,
      totalGamesPlayed: 1247,
      totalChampionships: 9,
      totalTransactions: 2834
    };
  }

  navigateTo(section: string): void {
    this.router.navigate([`/${section.toLowerCase()}`]);
  }
}
