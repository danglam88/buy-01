import { Component, DoCheck } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements DoCheck {
  title = 'buy-01-frontend';
  isToolbarVisible: boolean = false;
  constructor(private router: Router) {}

  ngDoCheck() {
    let currenturl = this.router.url;
    if (currenturl == '/login' || currenturl == '/register') {
      this.isToolbarVisible = true;
    } else {
      this.isToolbarVisible = false;
    }
  }
}
