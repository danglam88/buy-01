import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
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
  userAvatar: any;
  defaultAvatar = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
  @ViewChild('nameInput') nameInput: ElementRef;
  @ViewChild('emailInput') emailInput: ElementRef;
  @ViewChild('passwordInput') passwordInput: ElementRef;
  @ViewChild('fileInput') fileInput: ElementRef;

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
    this.getUserInfo();
  }

  // Get user information
  getUserInfo(): void {
    this.userService.getUserInfo().subscribe({
      next: (result) => {
        this.userInfo = result;
        if (this.userInfo.avatar != null && this.userInfo.avatarData != null) {
          this.getUserAvatar(this.userInfo.id);
        } else {
          this.avatar = this.defaultAvatar;
          this.userAvatar = null;
        }
      },
      error: (error) => {
        console.log(error);
        if (error.status == 401 || error.status == 403) {
          this.toastr.error('Session expired. Log-in again.');
          this.router.navigate(['../login']);
        }
      },
      complete: () => {
        console.log("User info retrieved");
      }
    });
  }

  // Get user avatar
  getUserAvatar(userId: string): void {
    this.userService.getUserAvatar(userId).subscribe({
      next: (result) => {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.userAvatar = e.target.result;
          this.avatar = this.userAvatar;
        };
        reader.readAsDataURL(result);
      },
      error: (error) => {
        if (error.status == 401 || error.status == 403) {
          this.toastr.error('Session expired. Log-in again.');
          this.router.navigate(['../login']);
        } 
      },
      complete: () => {
        console.log("Avatar retrieval complete");
      }
    });
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

  // Update user avatar
  updateAvatar(): void {
    this.updateUserInformation('avatar');
  }

  // Remove user avatar
  removeAvatar(): void {
    this.updateUserInformation('removeAvatar');
    this.avatar = this.defaultAvatar;
    this.cancelUploadImage();
  }

  // Common method to update user information. Add the field to formData and call the updateUser method
  updateUserInformation(updateField: string): void { 
    if (updateField === 'avatar'  || updateField === 'removeAvatar' || (this.userProfileForm.controls[updateField].valid)) {
      const formData = new FormData();
          // Check if this.avatar is not null and add it to formData
          if (this.userInfo.avatar != null && this.userInfo.avatarData != null && updateField !== 'removeAvatar') {
            const avatarBlob = this.dataURItoBlob(this.avatar);
            const avatarFile = new File([avatarBlob], this.userInfo.avatar);
            formData.append('file', avatarFile);
          }
      
        if (updateField === 'name') {
          formData.append('email', this.userInfo.email);
          formData.append('role', this.userInfo.role);
          formData.append('name', this.userProfileForm.value[updateField]);
        } 

        if (updateField === 'email') {
          formData.append('email', this.userProfileForm.value[updateField]);
          formData.append('role', this.userInfo.role);
          formData.append('name', this.userInfo.name);
        } 

        // Check if the updateField is 'password' and add it to formData
      if (updateField === 'password') {
          formData.append('email', this.userInfo.email);
          formData.append('role', this.userInfo.role);
          formData.append('name', this.userInfo.name);
          formData.append('password', this.userProfileForm.value[updateField]);
      }
  
      // Check if the updateField is 'avatar' and add the file to formData
      if (updateField === 'avatar') {
        formData.append('name', this.userInfo.name);
        formData.append('email', this.userInfo.email);
        formData.append('role', this.userInfo.role);
        formData.append('file', this.selectedFile);
      } 
      if (updateField === 'removeAvatar') {
        formData.append('name', this.userInfo.name);
        formData.append('email', this.userInfo.email);
        formData.append('role', this.userInfo.role);
      } 
    
      // Update user information
     this.userService.updateUser(formData, this.userInfo.id).subscribe({
        next: (result) => {
          console.log(result);
          this.getUserInfo();
        },
        error: (error) => {
          console.log(error);
          if (error.status == 400) {
            if (error.error.message) {
              this.toastr.error(error.error.message);
            } else if (error.error) {
              if (error.error[0]) {
                this.toastr.error(error.error[0]);
              } else {
                this.toastr.error(error.error);
              }
            } else {
              this.toastr.error('Something went wrong');
            }
          } else if (error.status == 401 || error.status == 403) {
            this.toastr.error('Session expired. Log-in again.');
            this.router.navigate(['../login']);
          } 
        },
        complete: () => {
          this.toastr.success(`${updateField} updated`);
          this.cancelFieldEdit();
          this.cancelUploadImage();
          if (updateField === 'email' || updateField === 'password') {
            this.router.navigate(['../login']);
          }
        },
      });
    } else {
      this.toastr.error(`Invalid ${updateField}`);
    }
  }
  
  // File input operations: select to preview image
  onFileSelected(event: any) {
    this.editProfileField('avatar');
    const file = event.target.files[0];
    if (this.isImageFile(file) && this.isFileSizeValid(file)) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewUrl = e.target.result;
        this.avatar = this.previewUrl
        this.selectedFile = file;
      };
      reader.onerror = (error) => {
        console.error('Error reading the selected image:', error);
      };
      reader.readAsDataURL(file);
    } else {
      console.log("invalid image upload");
      this.toastr.error('Cannot upload '+ file.name + '. Image file size must be less than 2MB and only JPEG, PNG and GIF are allowed)');
      this.fileInput.nativeElement.value = '';
    }
  }

  // Common method to capture which field is being updated and show the input field
  editProfileField(field: string): void {
    this.isEditingProfile = true;
    this.editingField = field;
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

  // Cancel editing profile
  cancelFieldEdit(): void {
    this.editingField = null;
  }

  // Cancel uploading avatar
  cancelUploadImage(): void {
    this.previewUrl = null
    if (this.userAvatar != null) {
      this.avatar = this.userAvatar;
    } else {
      this.avatar = this.defaultAvatar;
    }
    this.fileInput.nativeElement.value = '';
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
            if (error.status == 401 || error.status == 403) {
              this.toastr.error('Session expired. Log-in again.');
              this.router.navigate(['../login']);
            } 
          },
          complete: () => {
            this.toastr.success('User deleted');
            this.router.navigate(['../login']);
          }
        });
      }
    });
  }

   // Function to convert a Base64-encoded data URI to a Blob
  dataURItoBlob(dataURI: string): Blob {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  }

  isImageFile(file: File): boolean {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    return allowedTypes.includes(file.type);
  }

  isFileSizeValid(file: File): boolean {
    const maxSizeInBytes = 2 * 1024 * 1024; // 2MB
    return file.size <= maxSizeInBytes;
  }
}