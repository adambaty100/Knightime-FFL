import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TeamRecordsComponent } from './team-records/team-records';
import { StatCardComponent } from './stat-card/stat-card';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TeamRecordsComponent, StatCardComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('knightime-ffl-frontend');
}
