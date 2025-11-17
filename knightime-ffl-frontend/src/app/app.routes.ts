import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard';
import { TeamRecordsComponent } from './team-records/team-records';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'teams', component: TeamRecordsComponent },
  { path: 'games', component: TeamRecordsComponent },
  { path: 'championships', component: TeamRecordsComponent },
  { path: 'transactions', component: TeamRecordsComponent },
  { path: 'team-stats', component: TeamRecordsComponent },
  { path: 'sabermetrics', component: TeamRecordsComponent },
  { path: 'elo-ratings', component: TeamRecordsComponent },
  { path: 'raw-game-data', component: TeamRecordsComponent },
  { path: 'raw-data', component: TeamRecordsComponent }
];
