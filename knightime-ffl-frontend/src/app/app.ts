import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { NavComponent } from './nav/nav';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, NavComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {}
