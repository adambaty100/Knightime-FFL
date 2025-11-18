import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { timeout } from 'rxjs/operators';

interface Transaction {
  id: number;
  leagueMemberId: number;
  playerName: string;
  transactionType: string;
  year: number;
  week: string;
  notes: string;
}

interface LeagueMember {
  id: number;
  leagueMember: string;
  experience: number;
}

interface DisplayTransaction extends Transaction {
  leagueMemberName: string;
}

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './transactions.html',
  styleUrl: './transactions.css'
})
export class TransactionsComponent implements OnInit {
  allTransactions: DisplayTransaction[] = [];
  filteredTransactions: DisplayTransaction[] = [];
  
  leaguemembers: LeagueMember[] = [];
  availableYears: number[] = [];
  
  selectedMemberId: number | null = null;
  selectedYear: number | null = null;
  
  isLoading: boolean = true;
  error: string | null = null;

  private apiUrl = 'https://localhost:44372';
  private leagueMemberCache = new Map<number, string>();

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.error = null;

    console.log('Loading transactions from:', this.apiUrl);

    forkJoin([
      this.http.get<Transaction[]>(`${this.apiUrl}/transactions`).pipe(timeout(10000)),
      this.http.get<LeagueMember[]>(`${this.apiUrl}/leaguemembers`).pipe(timeout(10000))
    ]).subscribe({
      next: ([transactionsData, membersData]) => {
        console.log('Transactions loaded:', transactionsData.length);
        console.log('Members loaded:', membersData.length);
        
        this.leaguemembers = membersData.sort((a, b) => a.leagueMember.localeCompare(b.leagueMember));
        
        // Cache league member names
        membersData.forEach(member => {
          this.leagueMemberCache.set(member.id, member.leagueMember);
        });

        // Add league member names to transactions
        this.allTransactions = transactionsData.map(t => ({
          ...t,
          leagueMemberName: this.leagueMemberCache.get(t.leagueMemberId) || 'Unknown'
        }));

        this.extractAvailableYears();
        this.applyFilters();
        this.isLoading = false;
        console.log('Loading complete');
      },
      error: (err) => {
        console.error('Error loading transactions:', err);
        this.error = 'Failed to load transactions: ' + (err.message || 'Unknown error');
        this.isLoading = false;
      }
    });
  }

  private extractAvailableYears(): void {
    const years = new Set(this.allTransactions.map(t => t.year));
    this.availableYears = Array.from(years).sort((a, b) => b - a);
  }

  onMemberFilter(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedMemberId = target.value ? parseInt(target.value) : null;
    this.applyFilters();
  }

  onYearFilter(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedYear = target.value ? parseInt(target.value) : null;
    this.applyFilters();
  }

  private applyFilters(): void {
    let filtered = [...this.allTransactions];

    if (this.selectedMemberId !== null) {
      filtered = filtered.filter(t => t.leagueMemberId === this.selectedMemberId);
    }

    if (this.selectedYear !== null) {
      filtered = filtered.filter(t => t.year === this.selectedYear);
    }

    // Sort by year descending, then by week
    filtered.sort((a, b) => {
      if (a.year !== b.year) {
        return b.year - a.year;
      }
      return this.compareWeeks(a.week, b.week);
    });

    this.filteredTransactions = filtered;
  }

  private compareWeeks(weekA: string, weekB: string): number {
    // Handle undefined/null values
    if (!weekA && !weekB) return 0;
    if (!weekA) return 1;
    if (!weekB) return -1;

    // Extract week number for regular weeks
    const weekAMatch = weekA.match(/^(\d+)$/);
    const weekBMatch = weekB.match(/^(\d+)$/);
    
    // Check if they are Rd (round) games
    const isRdA = weekA.toLowerCase().startsWith('rd');
    const isRdB = weekB.toLowerCase().startsWith('rd');

    // If both are regular weeks, sort numerically
    if (weekAMatch && weekBMatch) {
      return parseInt(weekAMatch[1]) - parseInt(weekBMatch[1]);
    }

    // If one is Rd and other is a week, weeks come first
    if (isRdA && !isRdB) return 1;
    if (!isRdA && isRdB) return -1;

    // If both are Rd games, sort by the number after "Rd"
    if (isRdA && isRdB) {
      const rdAMatch = weekA.match(/rd\s*(\d+)/i);
      const rdBMatch = weekB.match(/rd\s*(\d+)/i);
      const rdANum = rdAMatch ? parseInt(rdAMatch[1]) : 0;
      const rdBNum = rdBMatch ? parseInt(rdBMatch[1]) : 0;
      return rdANum - rdBNum;
    }

    // Fallback to string comparison
    return weekA.localeCompare(weekB);
  }

  getTransactionTypeClass(type: string): string {
    const lower = type.toLowerCase();
    if (lower.includes('add') || lower.includes('claim')) return 'add';
    if (lower.includes('drop') || lower.includes('release')) return 'drop';
    if (lower.includes('trade')) return 'trade';
    if (lower.includes('waiver')) return 'waiver';
    return 'other';
  }

  clearFilters(): void {
    this.selectedMemberId = null;
    this.selectedYear = null;
    this.applyFilters();
  }

  get activeFilterCount(): number {
    let count = 0;
    if (this.selectedMemberId !== null) count++;
    if (this.selectedYear !== null) count++;
    return count;
  }
}
