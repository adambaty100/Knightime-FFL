import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';

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
export class NavComponent implements OnInit {
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
    // {
    //   title: 'Analytics',
    //   items: [
    //     { icon: '📈', label: 'Team Stats', route: '/team-stats' },
    //     { icon: '⚡', label: 'Sabermetrics', route: '/sabermetrics' },
    //     { icon: '🎯', label: 'ELO Ratings', route: '/elo-ratings' }
    //   ]
    // },
    // {
    //   title: 'Raw Data',
    //   items: [
    //     { icon: '📋', label: 'Raw Game Data', route: '/raw-game-data' },
    //     { icon: '💾', label: 'Raw Data', route: '/raw-data' }
    //   ]
    // }
  ];

  activeItem: string = 'Home';

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Set initial active item based on current route
    this.updateActiveItemFromRoute(this.router.url);

    // Listen for route changes and update active item
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.updateActiveItemFromRoute(event.url);
      });
  }

  private updateActiveItemFromRoute(url: string): void {
    // Find the nav item that matches the current route
    for (const section of this.navSections) {
      for (const item of section.items) {
        if (item.route === url) {
          this.activeItem = item.label;
          return;
        }
      }
    }
  }

  onNavItemClick(label: string, route: string): void {
    this.activeItem = label;
    this.router.navigate([route]);
  }
}
