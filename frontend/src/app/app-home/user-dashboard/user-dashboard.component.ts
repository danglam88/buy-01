import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { UserInfoService } from 'src/app/services/user-info.service';
import { UpdateUserService } from 'src/app/services/update-user.service';
import { DeleteUserService } from 'src/app/services/delete-user.service';

@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css']
})
export class UserDashboardComponent implements OnInit {
  userProfileForm: FormGroup;
  userInfo: any = {};
  previewUrl: string | ArrayBuffer | null = null;
  isEditingProfile: boolean = false;
  editingField: string | null = null;
  @ViewChild('nameInput') nameInput: ElementRef;
  @ViewChild('emailInput') emailInput: ElementRef;
  @ViewChild('passwordInput') passwordInput: ElementRef;

  constructor(
    private userInfoService: UserInfoService,
    private updateUserService: UpdateUserService,
    private deleteUserService: DeleteUserService,
    private toastr: ToastrService,
    private builder: FormBuilder,
    private router: Router,
    private dialog: MatDialog
  ) {
    this.toastr.toastrConfig.positionClass = 'toast-bottom-right';
  }

  ngOnInit(): void {
    this.userProfileForm = this.builder.group({
      name: [
        this.userInfo.name,
        [
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(50),
        ],
      ],
      email: [
        this.userInfo.email,
        [
          Validators.required,
          Validators.maxLength(50),
          Validators.email,
        ],
      ],
      password: [
        null,
        [
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(50),
          Validators.pattern(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/
          ),
        ],
      ],
    });

    this.userInfoService.getUserInfo().subscribe({
      next: (result) => {
        console.log(result);
        this.userInfo = result;
      },
      error: (error) => {
        console.log(error);
        if (error.status == 404) {
          console.log("User not found");
        }
      },
      complete: () => {
        console.log("User info retrieved");
      }
    });
  }

  // Common method to update user information
  updateUserInformation(updateField: string): void {
    if (this.userProfileForm.controls[updateField].valid) {
      this.userInfo[updateField] = this.userProfileForm.value[updateField];
      this.updateUserService.updateUser(this.userInfo).subscribe({
        next: (result) => {
          console.log(result);
        },
        error: (error) => {
          console.log(error);
          if (error.status == 400) {
            for (let i = 0; i < error.error.length; i++) {
              this.toastr.error(error.error[i]);
            }
          } else if (error.status == 401) {
            this.toastr.error('Operation not allowed');
          } else if (error.status == 404) {
            this.toastr.error('User not found');
          }
        },
        complete: () => {
          this.toastr.success(`${updateField} updated`);
          this.cancelFieldEdit();
          if (updateField === 'email' || updateField === 'password') {
            this.router.navigate(['../login']);
          }
        },
      });
    } else {
      this.toastr.error(`Invalid ${updateField}`);
    }
  }

  // Update user name
  updateName(): void {
    this.updateUserInformation('name');
  }

  // Update user email
  updateEmail(): void {
    this.updateUserInformation('email');
  }

  // Update user password
  updatePassword(): void {
    this.updateUserInformation('password');
  }

  uploadImage(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  cancelUploadImage(): void {
    this.previewUrl = null;
    const fileInput: HTMLInputElement | null = document.querySelector('#fileInput');
    if (fileInput) {
      fileInput.value = '';
    }
  }

  editProfileField(field: string): void {
    this.isEditingProfile = true;
    this.editingField = field;
    console.log("editing field: " + this.editingField);
    if (field === 'name') {
      setTimeout(() => {
        this.nameInput.nativeElement.focus();
      });
    } else if (field === 'email') {
      setTimeout(() => {
        this.emailInput.nativeElement.focus();
      });
    } else if (field === 'password') {
      setTimeout(() => {
        this.passwordInput.nativeElement.focus();
      });
    }
  }

  cancelFieldEdit(): void {
    this.editingField = null;
  }

  // Delete user
  deleteUser(): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: { isDeleteProduct: false } 
    });
    dialogRef.afterClosed().subscribe((confirm: boolean) => {
      if (confirm) {
        console.log('User deleted');
        this.deleteUserService.deleteUser(this.userInfo).subscribe({
          next: (result) => {
            console.log(result);
          },
          error: (error) => {
            console.log(error);
            if (error.status == 401) {
              this.toastr.error('Operation not allowed');
            } else if (error.status == 404) {
              this.toastr.error('User not found');
            }
          },
          complete: () => {
            console.log('User deleted');
          }
        });
        this.toastr.success('User deleted');
        this.router.navigate(['../login']);
      }
    });
  }
}
