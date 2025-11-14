import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from '@angular/router';

type LeagueMembers = any;

export const leagueMemberResolver: ResolveFn<LeagueMembers> = async (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
) => {
    const response = await fetch('https://localhost:44372/LeagueMembers');
    const data = await response.json();
    console.log(data);
    return data;
};
