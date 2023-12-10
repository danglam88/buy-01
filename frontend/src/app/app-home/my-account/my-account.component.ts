import { Component } from '@angular/core';

@Component({
  selector: 'app-my-account',
  templateUrl: './my-account.component.html',
  styleUrls: ['./my-account.component.css']
})
export class MyAccountComponent{
  view: string = 'profile';

  showProfileSection(): void {
    this.view = 'profile';
  }

  showOrderSection(): void {
    this.view = 'orders';
  }

  showStatsSection(): void {
    this.view = 'stats';
  }
}
