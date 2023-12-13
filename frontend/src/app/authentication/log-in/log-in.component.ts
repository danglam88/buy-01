import { Component, OnInit } from "@angular/core";
import { AuthenticationService } from "src/app/services/authentication.service";
import { FormBuilder, Validators } from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import { Router } from "@angular/router";
import { EncryptionService } from "src/app/services/encryption.service";
import { MatDialogRef, MatDialog } from "@angular/material/dialog";
import { UserService } from "src/app/services/user.service";

@Component({
  selector: "app-log-in",
  templateUrl: "./log-in.component.html",
  styleUrls: ["./log-in.component.css"],
})
export class LogInComponent implements OnInit {
  constructor(
    private builder: FormBuilder,
    private toastr: ToastrService,
    private authService: AuthenticationService,
    private encryptionService: EncryptionService,
    private router: Router,
    private dialog: MatDialog,
    private userService: UserService
  ) {
    this.toastr.toastrConfig.positionClass = "toast-bottom-right";
    //console.log("sessionStorage", encryptionService.decrypt(sessionStorage.getItem("loggedIn")));
    if (this.encryptionService.decrypt(sessionStorage.getItem("loggedIn")) === "true") {
      console.log("User is logged in in login component");
      this.router.navigate(["../home"]);
    } else {
      sessionStorage.clear();
    }
  }

  loginform = this.builder.group({
    username: this.builder.control("", Validators.required),
    password: this.builder.control("", Validators.required),
  });

  ngOnInit(): void {
    const openDialogs: MatDialogRef<any>[] = this.dialog.openDialogs;
    if (openDialogs && openDialogs.length > 0) {
      openDialogs.forEach((dialog: MatDialogRef<any>) => {
        dialog.close();
      });
    }
  }

  login() {
    this.authService.authenticate(this.loginform.value).subscribe({
      next: (result) => {
        this.userService.setUserInfoRole(result["role"]);
        const encryptedObj = this.encryptionService.encrypt(
          JSON.stringify(result)
        );
        sessionStorage.setItem("srt", encryptedObj);
      },
      error: (error) => {
        if (error.status == 400) {
          if (error.error.message) {
            this.toastr.error(error.error.message);
          } else if (error.error) {
            for (const errorMessage of error.error) {
              this.toastr.error(errorMessage);
            }
          } else {
            this.toastr.error("Something went wrong");
          }
        } else if (error.status == 401 || error.status == 403) {
          this.toastr.error("Invalid credentials");
        }
      },
      complete: () => {
        this.authService.login();
        const encryptedLoggedIn = this.encryptionService.encrypt("true");
        sessionStorage.setItem("loggedIn", encryptedLoggedIn);
        this.router.navigate(["../home"]);
      },
    });
  }
}
