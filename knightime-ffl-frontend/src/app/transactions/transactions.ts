import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { forkJoin, timeout, catchError } from 'rxjs';
import { of } from 'rxjs';

interface Transaction {
  id: number;
  leagueMemberId: number;
  trades: number;
  acquisitions: number;
  drops: number;
  activations: number;
  ir: number;
  year: number;
}

interface LeagueMember {
  id: number;
  name?: string;
  leagueMember?: string;
  experience?: number;
}

interface TransactionDisplay extends Transaction {
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
  transactions: TransactionDisplay[] = [];
  filteredTransactions: TransactionDisplay[] = [];
  leagueMembers: LeagueMember[] = [];
  years: number[] = [];
  
  selectedMember: number | null = null;
  selectedYear: number | null = null;
  
  isLoading = true;
  error: string | null = null;

  private apiUrl = 'https://localhost:44372';
  private leagueMembersCache: Map<number, string> = new Map();

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.isLoading = true;
    this.error = null;

    forkJoin([
      this.http.get<Transaction[]>(`${this.apiUrl}/transactions`).pipe(
        timeout(10000),
        catchError(err => {
          console.error('Error loading transactions:', err);
          return of([]);
        })
      ),
      this.http.get<LeagueMember[]>(`${this.apiUrl}/leaguemembers`).pipe(
        timeout(10000),
        catchError(err => {
          console.error('Error loading league members:', err);
          return of([]);
        })
      )
    ]).subscribe({
      next: ([transactionData, memberData]) => {
        console.log('Transactions loaded:', transactionData);
        console.log('League members loaded:', memberData);
        console.log('Member data sample:', memberData[0]);
        
        // Cache league member names (ensure IDs are numbers)
        memberData.forEach(member => {
          // Try both 'name' and 'leagueMember' property names
          const memberName = member.name || member.leagueMember || 'Unknown';
          console.log(`Caching member ${member.id}:`, memberName);
          this.leagueMembersCache.set(Number(member.id), memberName);
        });

        // Map transaction data with league member names (ensure IDs are numbers)
        this.transactions = transactionData.map(t => {
          const name = this.leagueMembersCache.get(Number(t.leagueMemberId)) || 'Unknown Member';
          console.log(`Transaction ${t.id}: memberId=${t.leagueMemberId}, name=${name}`);
          return {
            ...t,
            leagueMemberName: name
          };
        });

        // Extract unique years and sort descending
        this.years = [...new Set(this.transactions.map(t => t.year))].sort((a, b) => b - a);

        // Extract unique league members and sort by name
        this.leagueMembers = memberData.sort((a, b) => {
          const nameA = a.name || a.leagueMember || '';
          const nameB = b.name || b.leagueMember || '';
          return nameA.localeCompare(nameB);
        });

        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading data:', err);
        this.error = 'Failed to load transactions';
        this.isLoading = false;
      }
    });
  }

  onMemberFilter(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedMember = value ? parseInt(value) : null;
    this.applyFilters();
  }

  onYearFilter(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedYear = value ? parseInt(value) : null;
    this.applyFilters();
  }

  clearFilters(): void {
    this.selectedMember = null;
    this.selectedYear = null;
    this.applyFilters();
  }

  private applyFilters(): void {
    this.filteredTransactions = this.transactions.filter(t => {
      const memberMatch = !this.selectedMember || t.leagueMemberId === this.selectedMember;
      const yearMatch = !this.selectedYear || t.year === this.selectedYear;
      return memberMatch && yearMatch;
    }).sort((a, b) => {
      // Sort by year descending, then by league member name
      if (a.year !== b.year) {
        return b.year - a.year;
      }
      const nameA = a.leagueMemberName || '';
      const nameB = b.leagueMemberName || '';
      return nameA.localeCompare(nameB);
    });
  }

  getActiveFilterCount(): number {
    let count = 0;
    if (this.selectedMember) count++;
    if (this.selectedYear) count++;
    return count;
  }

  getTotalTransactions(): number {
    return this.filteredTransactions.reduce((sum, t) => {
      return sum + t.trades + t.acquisitions + t.drops + t.activations + t.ir;
    }, 0);
  }
}
