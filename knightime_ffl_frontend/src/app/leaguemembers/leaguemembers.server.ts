import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from '@angular/router';

type LeagueMembers = any;

export const leagueMemberResolver: ResolveFn<LeagueMembers> = async (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
) => {
    const response = await fetch('http://localhost:5246/LeagueMembers');
    const data = await response.json();
    console.log(data);
    return data;
};
