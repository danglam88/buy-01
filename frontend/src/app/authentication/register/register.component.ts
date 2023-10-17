import { Component, OnInit, ViewChild, ElementRef  } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { RegistratonService } from '../../services/registraton.service'
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})

export class RegisterComponent implements OnInit {
  previewUrl: string | ArrayBuffer | null = null;
  selectedFile: File;
  userInfo: any = {};
  @ViewChild('nameInput') nameInput: ElementRef;

  constructor(
    private builder: FormBuilder, 
    private toastr: ToastrService,
    private regService: RegistratonService,
    private router: Router) {
      this.toastr.toastrConfig.positionClass = 'toast-bottom-right'; 
     }

  ngOnInit() {}

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

  // Cancel file upload
  cancelUploadImage() {
    this.previewUrl = null;
    // Optionally reset the file input if needed
    const fileInput: HTMLInputElement | null = document.querySelector('#fileInput');
    if (fileInput) {
      fileInput.value = '';
    }
  }

  // Register user
  register() {
    if (this.registerform.valid) {
      // this.userInfo = {
      //   name: this.registerform.value.name.replace(/\s+/g, ' ').trim(),
      //   email: this.registerform.value.email,
      //   password: this.registerform.value.password,
      //   role: this.registerform.value.role,
      // }
      
      const formData = new FormData();
      formData.append('file', this.selectedFile);
      formData.append('name', this.registerform.value.name.replace(/\s+/g, ' ').trim());
      formData.append('email', this.registerform.value.email);
      formData.append('password', this.registerform.value.password);
      formData.append('role', this.registerform.value.role);
      
      this.regService.register(formData).subscribe({
        next: (result) => {
          console.log(result);
        },
        error: (error) => {
          console.log(error);
          if (error.status == 400) {
            this.toastr.error(error.error[0]);
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
}
