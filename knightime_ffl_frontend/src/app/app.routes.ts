import { Routes } from '@angular/router';
import { LeagueMembers } from './leaguemembers/leaguemembers';
import { leagueMemberResolver } from './leaguemembers/leaguemembers.server';

export const routes: Routes = [
    {
        path: 'leaguemembers',
        component: LeagueMembers,
        resolve: {
            leagueMembers: leagueMemberResolver,
        },
    },
];
