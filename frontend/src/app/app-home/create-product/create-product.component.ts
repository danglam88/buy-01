import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CreateProductService } from 'src/app/services/create-product.service';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-create-product',
  templateUrl: './create-product.component.html',
  styleUrls: ['./create-product.component.css'],
})
export class CreateProductComponent implements OnInit {
  productInfo: any = {};
  previewUrl: string | ArrayBuffer | null = null;
  imgPlaceholder = '../../../../assets/images/uploadPhoto.jpg';
  @ViewChild('nameInput') nameInput: ElementRef;

  constructor(
    private builder: FormBuilder,
    private toastr: ToastrService,
    private createProductService: CreateProductService,
    private productService: ProductService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<CreateProductComponent>
  ) {
    this.toastr.toastrConfig.positionClass = 'toast-bottom-right';
  }

  ngOnInit() {
    setTimeout(() => {
      this.nameInput.nativeElement.focus();
    });
  }

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
      [Validators.required, Validators.pattern(/^\d+(\.\d+)?$/)],
    ],
    quantity: [
      '',
      [Validators.required, Validators.pattern(/^[0-9]+$/)],
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

  closeModal(): void {
    this.dialogRef.close();
  }

  createProduct() {
    if (this.createProductForm.valid) {
      this.productInfo = this.prepareProductInfo();
      this.createProductService.createProduct(this.productInfo).subscribe({
        next: (result) => {
          this.handleProductCreationSuccess(result);
        },
        error: (error) => {
          this.handleProductCreationError(error);
        },
      });
    } else {
      this.handleValidationErrors();
    }
  }

  prepareProductInfo() {
    return {
      name: this.createProductForm.controls.name.value.replace(/\s+/g, ' ').trim(),
      price: this.createProductForm.controls.price.value,
      quantity: this.createProductForm.controls.quantity.value,
      description: this.createProductForm.controls.description.value.replace(/\s+/g, ' ').trim(),
      image: this.imgPlaceholder,
    };
  }

  handleProductCreationSuccess(result: any) {
    this.toastr.success('Product created successfully.');
    //this.productService.addProduct(this.productInfo);
    this.closeModal();
  }

  handleProductCreationError(error: any) {
    console.error(error);
    this.toastr.error('Product creation failed.');
  }

  handleValidationErrors() {
    if (this.createProductForm.controls.name.invalid) {
      this.toastr.error('Name must be between 1 and 50 characters.');
    } else if (this.createProductForm.controls.price.invalid) {
      this.toastr.error('Please enter a valid price.');
    } else if (this.createProductForm.controls.quantity.invalid) {
      this.toastr.error('Please enter a valid quantity.');
    } else if (this.createProductForm.controls.description.invalid) {
      this.toastr.error('Description must be between 1 and 1000 characters.');
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.displaySelectedImage(file);
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

  cancelUploadImage() {
    this.resetImageInput();
  }

  resetImageInput() {
    this.previewUrl = null;
    const fileInput: HTMLInputElement | null = document.querySelector('#fileInput');
    if (fileInput) {
      fileInput.value = '';
    }
  }
}
