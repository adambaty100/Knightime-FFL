import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LeagueMembers } from "./leaguemembers/leaguemembers";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LeagueMembers],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('knightime_ffl_frontend');
}
