import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface NavItem {
  icon: string;
  label: string;
  route: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './nav.html',
  styleUrl: './nav.css'
})
export class NavComponent {
  navSections: NavSection[] = [
    {
      title: '', 
      items: [
        { icon: '🏠', label: 'Home', route: '/' }
      ]
    },
    {
      title: 'Overview',
      items: [
        { icon: '📊', label: 'Team Data', route: '/teams' },
        { icon: '🏈', label: 'Game Data', route: '/games' },
        { icon: '🔄', label: 'Transactions', route: '/transactions' }
      ]
    },
    {
      title: 'Analytics',
      items: [
        { icon: '📈', label: 'Team Stats', route: '/team-stats' },
        { icon: '⚡', label: 'Sabermetrics', route: '/sabermetrics' },
        { icon: '🎯', label: 'ELO Ratings', route: '/elo-ratings' }
      ]
    },
    {
      title: 'Raw Data',
      items: [
        { icon: '📋', label: 'Raw Game Data', route: '/raw-game-data' },
        { icon: '💾', label: 'Raw Data', route: '/raw-data' }
      ]
    }
  ];

  activeItem: string = 'Home';

  constructor(private router: Router) {}

  onNavItemClick(label: string, route: string): void {
    this.activeItem = label;
    this.router.navigate([route]);
  }
}
