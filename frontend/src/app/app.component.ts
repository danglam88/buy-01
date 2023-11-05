import { Component, DoCheck } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements DoCheck {
  title = 'Buy-01';
  isToolbarVisible: boolean = false;

  constructor(private router: Router) {}

  ngDoCheck() {
    let currenturl = this.router.url;
    // console.log(this.isToolbarVisible);
    if (currenturl == '/login' || currenturl == '/register') {
      this.isToolbarVisible = true;
      // console.log(this.isToolbarVisible);
    } else {
      this.isToolbarVisible = false;
    }
  }
}
