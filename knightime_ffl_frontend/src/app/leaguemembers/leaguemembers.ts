import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'league-members',
    imports: [],
    styleUrl: './leaguemembers.css',
    templateUrl: './leaguemembers.html',
})
export class LeagueMembers {
    private route = inject(ActivatedRoute);
    private data = toSignal(this.route.data);
    leagueMembers = computed(() => this.data()!['leagueMembers']);
    leagueMembersJson = computed(() => JSON.stringify(this.leagueMembers()));
}
