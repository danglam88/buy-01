import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { UserService } from 'src/app/services/user.service';

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
  selectedFile: File;
  avatar : any;
  @ViewChild('nameInput') nameInput: ElementRef;
  @ViewChild('emailInput') emailInput: ElementRef;
  @ViewChild('passwordInput') passwordInput: ElementRef;

  constructor(
    private userService: UserService,
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


  
    this.userService.getUserInfo().subscribe({
      next: (result) => {
        console.log(JSON.stringify(result));
        this.userInfo = result;
        console.log("user info: " + JSON.stringify(this.userInfo.id));

        this.userService.getUserAvatar(this.userInfo.id).subscribe({
          next: (result) => {
            console.log(result);
            this.avatar = result;
            const reader = new FileReader();
            reader.onload = (e: any) => {
              this.avatar  = e.target.result;
            };
            reader.readAsDataURL(this.avatar);
          },
          error: (error) => {
            console.log(error);
          },
          complete: () => {
            console.log("Avatar retrieved");
          }
        });
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
      const formData = new FormData();
      formData.append('name', this.userProfileForm.value[updateField]);
      formData.append('email', this.userInfo.email);
      formData.append('role', this.userInfo.role);
      
      formData.append('file', this.selectedFile);
      if (updateField === 'password') {
        formData.append('password', this.userProfileForm.value[updateField]);
      }
     
      this.userService.updateUser(formData, this.userInfo.id).subscribe({
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

  updateAvatar(): void {
    this.updateUserInformation('avatar');
  }

  uploadImage(event: any): void {
    this.editProfileField('avatar');
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewUrl = e.target.result;
        this.selectedFile = file;
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

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewUrl = e.target.result;
        this.selectedFile = file;
      };
      reader.onerror = (error) => {
        console.error('Error reading the selected image:', error);
      };
      reader.readAsDataURL(file);
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
      data: {
        confirmationText: 'Delete this account?' 
      }
    });
    dialogRef.afterClosed().subscribe((confirm: boolean) => {
      if (confirm) {
        console.log('User deleted');
        this.userService.deleteUser(this.userInfo).subscribe({
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