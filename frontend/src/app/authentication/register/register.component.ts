import { Component, ViewChild, ElementRef  } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

import { RegistrationService } from '../../services/registration.service';
import { ValidationService } from 'src/app/services/validation.service';
import { ErrorService } from 'src/app/services/error.service';
import { EncryptionService } from 'src/app/services/encryption.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})

export class RegisterComponent  {
  imgPlaceholder = '../../assets/images/placeholder.png';
  previewUrl: string | ArrayBuffer | null = null;
  selectedFile: File;
  userInfo: any = {};
  isRegistering = false;
  @ViewChild('nameInput') nameInput: ElementRef;
  @ViewChild('fileInput') fileInput: ElementRef;
  toastrConfig: any = {};

  constructor(
    private builder: FormBuilder, 
    private toastr: ToastrService,
    private registrationService: RegistrationService,
    private encryptionService: EncryptionService,
    private validationService: ValidationService,
    private errorService: ErrorService,
    private router: Router) {
      if (this.encryptionService.decrypt(localStorage.getItem("loggedIn")) === "true") {
        console.log("User is logged in in reigistration component");
        this.router.navigate(["../home"]);
      } 
      this.toastrConfig = this.toastr.toastrConfig;
    this.toastrConfig.positionClass = 'toast-bottom-right';
     }

  ngAfterViewInit() {
    // Set focus on the name input element when the component initializes
    this.nameInput.nativeElement.focus();
  }

  // Validate register form for name, email, password and role fields
  registerform = this.builder.group({
    name: [
      '',
      [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(50),
      ],
    ],
    email: [
      '',
      [
        Validators.required,
        Validators.maxLength(50),
        Validators.email,
      ],
    ],

    password: [
      '',
      [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(50),
        Validators.pattern(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/
        ), 
      ],
    ],
    role:this.builder.control('', Validators.required),
  });

  // File upload
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (this.validationService.isImageFile(file) && this.validationService.isFileSizeValid(file)) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewUrl = e.target.result;
        this.selectedFile = file;
      };
      reader.onerror = (error) => {
        console.error('Error reading the selected image:', error);
      };
      reader.readAsDataURL(file);
    } else {
      this.toastr.error('Cannot upload '+ file.name + '. Check condition for a valid image file');
      this.fileInput.nativeElement.value = '';
    }
  }

  // Cancel file upload
  cancelUploadImage() {
    this.previewUrl = null;
    this.fileInput.nativeElement.value = '';
    this.selectedFile = null;
  }

  // Register user
  register() {
    if (this.registerform.valid) {
      this.isRegistering = true;
      const formData = new FormData();
      formData.append('file', this.selectedFile);
      formData.append('name', this.registerform.value.name.replace(/\s+/g, ' ').trim());
      formData.append('email', this.registerform.value.email);
      formData.append('password', this.registerform.value.password);
      formData.append('role', this.registerform.value.role);
      
      this.registrationService.register(formData).subscribe({
        next: (result) => {
        },
        error: (error) => {
          if (this.errorService.is400Error(error.status)) {
          this.errorService.handleBadRequestError(error);
          } 
        },
        complete: () => {
          this.toastr.success('Registration successful');
          this.router.navigate(['/login']);
        }
      });
    } else {
      if (this.registerform.controls.name.status == "INVALID") {
        this.toastr.error('Please enter a valid name (maximum 50 characters)');
      } else if (this.registerform.controls.email.status == "INVALID") {
        this.toastr.error('Please enter a valid email');
      } else if (this.registerform.controls.password.status == "INVALID") {
        this.toastr.error('Please enter a valid password (from 6 to 50 characters) which contains at least one uppercase letter, one lowercase letter, one digit and one special character (@$!%*?&)');
      } else if (this.registerform.controls.role.status == "INVALID") {
        this.toastr.error('Please select a role');
      } else {
        this.toastr.error('Please enter valid information');
      }
    }
  }

  onKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      // Check if the form is invalid
      if (this.registerform.invalid) {
        event.preventDefault(); // Prevent the default Enter key behavior (form submission)
      } else {
        this.register();
      }
    }
  } 
}
