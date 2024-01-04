import { Injectable } from "@angular/core";
import { ToastrService } from "ngx-toastr";
import { AuthenticationService } from "./authentication.service";

@Injectable({
  providedIn: "root",
})
export class ErrorService {
  constructor(
    private toastr: ToastrService,
    private authService: AuthenticationService
  ) {}

  // Log out user if session expires
  handleSessionExpirationError(): void {
    this.toastr.error("Session expired. Log-in again.");
    this.authService.logout();
  }

  // Display error message for bad request errors
  handleBadRequestError(error: any): void {
    if (error.error.message) {
      this.toastr.error(error.error.message);
    } else if (error.error && error.error[0]) {
      this.toastr.error(error.error[0]);
    } else {
      this.toastr.error("Something went wrong");
    }
  }

  // Checks for 401 or 403 errors
  isAuthError(status: number): boolean {
    return status === 401 || status === 403;
  }

  is400Error(status: number): boolean {
    return status === 400;
  }
}
