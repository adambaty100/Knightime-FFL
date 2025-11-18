import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard';
import { TeamRecordsComponent } from './team-records/team-records';
import { GameDataComponent } from './game-data/game-data';
import { TransactionsComponent } from './transactions/transactions';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'teams', component: TeamRecordsComponent },
  { path: 'games', component: GameDataComponent },
  { path: 'championships', component: TeamRecordsComponent },
  { path: 'transactions', component: TransactionsComponent },
  { path: 'team-stats', component: TeamRecordsComponent },
  { path: 'sabermetrics', component: TeamRecordsComponent },
  { path: 'elo-ratings', component: TeamRecordsComponent },
  { path: 'raw-game-data', component: GameDataComponent },
  { path: 'raw-data', component: TeamRecordsComponent }
];
