import { Component } from "@angular/core";
import { UserService } from "src/app/services/user.service";

@Component({
  selector: "app-my-orders",
  templateUrl: "./my-orders.component.html",
  styleUrls: ["./my-orders.component.css"],
})
export class MyOrdersComponent {
  view: string = "orders";
  role: string = "";

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.role = this.userService.getUserInfoRole();
  }

  // Display orders section when clicked
  showOrderSection(): void {
    this.view = "orders";
  }

  // Display stats section when clicked
  showStatsSection(): void {
    this.view = "stats";
  }
}
