import { Component, ElementRef, Inject, ViewChild } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";

import { ProductService } from "src/app/services/product.service";
import { ValidationService } from "src/app/services/validation.service";
import { ErrorService } from "src/app/services/error.service";

@Component({
  selector: "app-create-product",
  templateUrl: "./create-product.component.html",
  styleUrls: ["./create-product.component.css"],
})
export class CreateProductComponent {
  previewUrl: string | ArrayBuffer | null = null;
  imgPlaceholder = "../../../../assets/images/uploadPhoto.jpg";
  selectedFiles: Array<{ file: File; url: string }> = [];
  isCreatingProduct = false;
  @ViewChild("nameInput") nameInput: ElementRef;
  @ViewChild("fileInput") fileInput: ElementRef;

  constructor(
    private builder: FormBuilder,
    private toastr: ToastrService,
    private productService: ProductService,
    private validationService: ValidationService,
    private errorService: ErrorService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<CreateProductComponent>
  ) {}

  // Creates a product form with validation
  createProductForm = this.builder.group({
    name: [
      "",
      [Validators.required, Validators.minLength(1), Validators.maxLength(50)],
    ],
    price: [
      "",
      [
        Validators.required,
        Validators.pattern(/^\d+(\.\d+)?$/),
        Validators.max(999999999.99),
        this.validationService.greaterThanZeroValidator(), // Custom validator for price
      ],
    ],
    quantity: [
      "",
      [
        Validators.required,
        Validators.pattern(/^[0-9]+$/),
        Validators.max(999999999),
        this.validationService.greaterThanZeroValidator(),
      ],
    ],
    description: [
      "",
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
      this.isCreatingProduct = true;
      const formData = new FormData();
      for (const selectedFile of this.selectedFiles) {
        const file = selectedFile.file;
        formData.append("files", file);
      }
      formData.append(
        "name",
        this.createProductForm.controls.name.value.replace(/\s+/g, " ").trim()
      );
      formData.append("price", this.createProductForm.controls.price.value);
      formData.append(
        "quantity",
        this.createProductForm.controls.quantity.value
      );
      formData.append(
        "description",
        this.createProductForm.controls.description.value
          .replace(/\s+/g, " ")
          .trim()
      );

      this.productService.createProduct(formData).subscribe({
        next: () => {
          this.productService.productCreated.emit(true);
        },
        error: (error) => {
          if (this.errorService.is400Error(error.status)) {
            this.errorService.handleBadRequestError(error);
          } else if (this.errorService.isAuthError(error.status)) {
            this.errorService.handleSessionExpirationError();
            this.closeModal();
          }
        },
        complete: () => {
          this.toastr.success("Product created successfully.");
          this.closeModal();
        },
      });
    } else {
      if (this.createProductForm.controls.name.invalid) {
        this.toastr.error("Name must be between 1 and 50 characters.");
      } else if (this.createProductForm.controls.price.invalid) {
        this.toastr.error("Please enter a valid price.");
      } else if (this.createProductForm.controls.quantity.invalid) {
        this.toastr.error("Please enter a valid quantity.");
      } else if (this.createProductForm.controls.description.invalid) {
        this.toastr.error("Description must be between 1 and 1000 characters.");
      } else if (this.selectedFiles.length === 0) {
        this.toastr.error("Please upload at least one image.");
      }
    }
  }

  // Handles the image selection from file input and displays the selected image to previewUrl
  onFileSelected(event: any) {
    const files: FileList = event.target.files;
    // Convert FileList to an array
    const filesArray: File[] = Array.from(files);
    if (this.selectedFiles.length + filesArray.length > 5) {
      this.toastr.error("You can only add a maximum of 5 images.");
    } else if (filesArray.length > 0) {
      for (const file of filesArray) {
        // Check the file type (allow only images)
        if (this.validationService.isImageFile(file)) {
          // Check the file size (limit to 2MB)
          if (this.validationService.isFileSizeValid(file)) {
            this.displaySelectedImage(file);
            this.selectedFiles.push({ file, url: URL.createObjectURL(file) });
          } else {
            this.toastr.error(
              `Cannot upload ${file.name}. File size exceeds the limit (2MB). Please select a smaller image.`
            );
          }
        } else {
          this.toastr.error(
            `Cannot upload ${file.name}. Invalid file type. Please select an image (e.g., JPEG, PNG, GIF).`
          );
        }
      }
    }
  }

  displaySelectedImage(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      this.previewUrl = e.target.result;
    };
    reader.onerror = (error) => {
      console.error("Error reading the selected image:", error);
    };
    reader.readAsDataURL(file);
  }

  // Removes selected image before saving
  onImageRemoved(index: number) {
    this.selectedFiles.splice(index, 1);
    if (this.selectedFiles.length === 0) {
      this.fileInput.nativeElement.value = "";
      this.previewUrl = null;
    }
  }

  // Close the modal
  closeModal(): void {
    this.dialogRef.close();
  }
}
