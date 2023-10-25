import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ProductService } from 'src/app/services/product.service';
import { MediaService } from 'src/app/services/media.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-product',
  templateUrl: './create-product.component.html',
  styleUrls: ['./create-product.component.css'],
})
export class CreateProductComponent implements OnInit {
  productInfo: any = {};
  mediaInfo: any = {};
  previewUrl: string | ArrayBuffer | null = null;
  imgPlaceholder = '../../../../assets/images/uploadPhoto.jpg';
  selectedFiles: Array<{ file: File, url: string }> = [];
  @ViewChild('nameInput') nameInput: ElementRef;
  @ViewChild('fileInput') fileInput: ElementRef;

  constructor(
    private builder: FormBuilder,
    private toastr: ToastrService,
    private productService: ProductService,
    private mediaService: MediaService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<CreateProductComponent>, 
    private router: Router,
  ) {
    this.toastr.toastrConfig.positionClass = 'toast-bottom-right';
  }

  ngOnInit() {}

  // Creates a product form with validation
  createProductForm = this.builder.group({
    name: [
      '',
      [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(50),
      ],
    ],
    price: [
      '',
      [
        Validators.required,
        Validators.pattern(/^\d+(\.\d+)?$/),
        this.greaterThanZeroValidator(), // Custom validator for price
      ],
    ],
    quantity: [
      '',
      [
        Validators.required,
        Validators.pattern(/^[0-9]+$/),
        this.greaterThanZeroValidator(), // Custom validator for quantity
      ],
    ],
    description: [
      '',
      [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(1000),
      ],
    ],
  });

  // Create a product and handles errors, including validation errors from createProductForm
  createProduct() {
    if (this.createProductForm.valid && this.selectedFiles.length > 0) {
      const formData = new FormData();
      for (let index = 0; index < this.selectedFiles.length; index++) {
        const file = this.selectedFiles[index].file;
        formData.append('files', file);
      }
      formData.append('name', this.createProductForm.controls.name.value.replace(/\s+/g, ' ').trim());
      formData.append('price', this.createProductForm.controls.price.value);
      formData.append('quantity', this.createProductForm.controls.quantity.value);
      formData.append('description', this.createProductForm.controls.description.value.replace(/\s+/g, ' ').trim());

      this.productService.createProduct(formData).subscribe({
        next: (result) => {
          this.productService.productCreated.emit(true);
        },
        error: (error) => {
          if (error.status === 400) {
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
          } else if (error.status === 403 || error.status === 401){  
            this.toastr.error('Session expired. Log-in again.');
            this.closeModal();
            this.router.navigate(['../login']);
          }
        },
        complete: () => {
          this.toastr.success('Product created successfully.');
          this.closeModal();
        }
      });
     
    } else {
      if (this.createProductForm.controls.name.invalid) {
        this.toastr.error('Name must be between 1 and 50 characters.');
      } else if (this.createProductForm.controls.price.invalid) {
        this.toastr.error('Please enter a valid price.');
      } else if (this.createProductForm.controls.quantity.invalid) {
        this.toastr.error('Please enter a valid quantity.');
      } else if (this.createProductForm.controls.description.invalid) {
        this.toastr.error('Description must be between 1 and 1000 characters.');
      } else if (this.selectedFiles.length === 0) {
        this.toastr.error('Please upload at least one image.');
      }
    }
  }

  // Handles the image selection from file input and displays the selected image to previewUrl
  onFileSelected(event: any) {
    const files: FileList = event.target.files;
    if (this.selectedFiles.length + files.length > 5) {
      this.toastr.error('You can only add a maximum of 5 images.');
    } else if (files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        this.displaySelectedImage(file);
        this.selectedFiles.push({ file, url: URL.createObjectURL(file) });
      }
    }
  }

  displaySelectedImage(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      this.previewUrl = e.target.result;
    };
    reader.onerror = (error) => {
      console.error('Error reading the selected image:', error);
    };
    reader.readAsDataURL(file);
  }

  // Removes selected image before saving
  onImageRemoved(index: number) {
    this.selectedFiles.splice(index, 1);
    if (this.selectedFiles.length === 0) {
      this.fileInput.nativeElement.value = '';
      this.previewUrl = null;
    }
  }

  // Close the modal
  closeModal(): void {
    this.dialogRef.close();
  }

  greaterThanZeroValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = parseFloat(control.value);
      if (isNaN(value) || value <= 0) {
        return { greaterThanZero: true };
      }
      return null;
    };
  }

}
