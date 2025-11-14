import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TeamRecordsComponent } from './team-records/team-records';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TeamRecordsComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('knightime-ffl-frontend');
}
