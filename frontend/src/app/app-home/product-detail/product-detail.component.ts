import { Component, OnInit, Input, Inject, ViewChild, ElementRef } from '@angular/core';
import { Product } from '../../Models/Product';
import { FormGroup, FormBuilder, Validators, AbstractControl, ValidatorFn  } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ProductService } from 'src/app/services/product.service';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { MediaService } from 'src/app/services/media.service';
import { EncryptionService } from 'src/app/services/encryption.service';
import { Router } from '@angular/router';

@Component({
  selector: 'product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {
  @Input() product: Product;
  editingField: string | null = null;
  productImages: any = {};
  mediaID: any = {};
  productDetailForm: FormGroup;
  noOfImages: number;
  selectedFiles: Array<{ file: File, url: string }> = [];
  previewUrl: string | ArrayBuffer | null = null;
  isAddingImages = false;
  isDeletingImages = false;
  isEditingImages = false;
  currentIndexOfImageSlider = 0;
  imgPlaceholder = '../../../../assets/images/uploadPhoto.jpg';
  @ViewChild('nameInput') nameInput: ElementRef;
  @ViewChild('priceInput') priceInput: ElementRef;
  @ViewChild('quantityInput') quantityInput: ElementRef;
  @ViewChild('descriptionInput') descriptionInput: ElementRef;

  constructor(
    private productService: ProductService,
    private mediaService: MediaService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ProductDetailComponent>,
    private builder: FormBuilder,
    private toastr: ToastrService,
    private dialog: MatDialog,
    private encryptionService: EncryptionService, 
    private router: Router,
  ) {
    this.product = data.product; // get product details from product-listing component
    this.toastr.toastrConfig.positionClass = 'toast-bottom-right';

    // Handles product media updates and get product images again from media service
    this.mediaService.productMediaUpdated.subscribe((productMediaUpdated) => {
      if (productMediaUpdated) {
        this.productImages = {};
        this.getProductImages(this.product.id);
        this.currentIndexOfImageSlider = this.noOfImages;
      }
    });

    // Handles product media deletion and get product images again from media service
    this.mediaService.productMediaDeleted.subscribe((productMediaDeleted) => {
      if (productMediaDeleted) {
        this.productImages = {};
        this.getProductImages(this.product.id);
        if (this.currentIndexOfImageSlider === this.noOfImages -1 ) {
          this.currentIndexOfImageSlider = 0;
        }
      }
    });
  }

  get userRole() : string {
    const encryptedSecret = sessionStorage.getItem('srt');
    if (encryptedSecret) {
      try {
        const currentToken = JSON.parse(this.encryptionService.decrypt(encryptedSecret))["role"];
        return currentToken;
      } catch (error) {
        this.router.navigate(['../login']);
      }
    }
    return '';
  }

  ngOnInit(): void {
    // Creates a productDetail form for updating with validation. 
    // Only seller of that product can update
    this.productDetailForm = this.builder.group({
      name: [
        this.product.name,
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
        this.product.description,
        [
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(1000),
        ],
      ],
    });

    this.getProductImages(this.product.id);
  }

   // Get product images from media service, save to productImages and display in image slider
  getProductImages(productId: string){
    this.mediaService.getImageByProductId(productId).subscribe({
      next: (result) => {
        for (const key in result) {
          if (result.hasOwnProperty(key)) {
            this.mediaService.getImageByMediaId(result[key]).subscribe({
              next: (image) => {
                const reader = new FileReader();
                reader.onload = () => {
                  this.productImages[key] = { data: reader.result, mediaId: result[key] };
                };
                reader.readAsDataURL(image); 
              },
              error: (error) => {
                if (error.status === 401 || error.status === 403) {
                  this.toastr.error('Session expired. Log-in again.');
                  this.dialogRef.close();
                  this.router.navigate(['../login']);
                }
              }
            });
          }
        }
        const objectLength = Object.keys(result).length;
        this.noOfImages = objectLength;
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  // Update the product based on which field is being edited
  updateField(field: string): void {
    if (this.productDetailForm.controls[field].invalid) {
      this.toastr.error(`Product ${field} is invalid`);
      return;
    }
    this.product[field] = this.productDetailForm.controls[field].value;
    this.productService.updateProduct(this.product).subscribe({
      next: (result) => {
        this.toastr.success(`Product ${field} updated`);
        this.editingField = null;
      },
      error: (error) => {
        if (error.status === 401 || error.status === 403) {
          this.toastr.error('Session expired. Log-in again.');
          this.dialogRef.close();
        } else if (error.status === 400) {
          this.router.navigate(['../forbidden']);
        } else{ 
          this.toastr.error(`Product ${field} update failed`);
        }
      }
    });
  }

  // Delete image from product
  deleteImage(currentImage: any) {
    if (currentImage) {
      const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
        data: {
          confirmationText: 'Delete this image?' 
        }
      });
      dialogRef.afterClosed().subscribe((confirm: boolean) => {
        if (confirm) {
          this.mediaService.deleteMedia(currentImage.mediaId).subscribe({
            next: (result) => {
              this.getProductImages(this.product.id);
              this.toastr.success('Image deleted');
              this.mediaService.productMediaDeleted.emit(true);
            },
            error: (error) => {
              console.log(error);
              if (error.status === 401 || error.status === 403) {
                this.toastr.error('Session expired. Log-in again.');
                this.dialogRef.close();
                this.router.navigate(['../login']);
              }
            },
            complete: () => {
              console.log('Image deleted');
            }
          });
        }
      });
    } else {
      console.log("currentImage is null or undefined");
    }
  }
  
  // Save newly uploaded images
  saveEditedImages() {
    if (this.noOfImages + this.selectedFiles.length > 5) {
      this.toastr.error('You can only add a maximum of 5 images', 'Image Limit Exceeded');
    } else {
      this.saveEachSelectedFile(this.product.id, 0)
      this.mediaService.productMediaUpdated.emit(true);
    }
  }

  // Delete the product and handle errors
  deleteProduct(): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        confirmationText: 'Delete this product?'
      }
    });

    dialogRef.afterClosed().subscribe((confirm: boolean) => {
      if (confirm) {
        console.log('Product deleted');
        this.productService.deleteProduct(this.product).subscribe({
          next: (result) => {
            this.productService.productDeleted.emit(true);
          },
          error: (error) => {
            if (error.status === 401 || error.status === 403) {
              this.toastr.error('Session expired. Log-in again.');
              this.dialogRef.close();
              this.router.navigate(['../login']);
            } else if (error.status === 400) {
              this.router.navigate(['../forbidden']);
            }
          },
          complete: () => {
            console.log('Product deleted');
          }
        });
        this.toastr.success('Product deleted');
        this.dialogRef.close();
      }
    });
  }

  // Capture which field is being updated on the productDetailForm and set the editingField to that field 
  editProfileField(field: string): void {
    this.editingField = field;
    if (field === 'addImages') {
      this.isAddingImages = true;
      this.isDeletingImages = false;
      this.isEditingImages = true; 
    } else if (field === 'deleteImages') {
      this.isAddingImages = false;
      this.isDeletingImages = true;
      this.isEditingImages = true; 
    }
    setTimeout(() => {
      this[field + 'Input']?.nativeElement.focus();
    });
  }

  // Cancel editing the field of the productDetailForm
  cancelFieldEdit(): void {
    this.editingField = null;
    this.isAddingImages = false;
    this.isDeletingImages = false;
    this.isEditingImages = false;
    this.selectedFiles = [];
    this.previewUrl = null;
    console.log("currentIndexOfImageSlider: ", this.currentIndexOfImageSlider)
    this.currentIndexOfImageSlider = 0
    console.log("this.noOfImages: ", this.noOfImages);
  }

  // Get the current image from the image slider
  get currentImage(): { url: string, mediaId: string } | null {
    const currentImageData = this.productImages[this.currentIndexOfImageSlider];
    if (currentImageData) {
      return {
        url: currentImageData.data,
        mediaId: currentImageData.mediaId,
      };
    } else {
      return null;
    }
  }

  previousSlide() {
    this.currentIndexOfImageSlider = (this.currentIndexOfImageSlider - 1 + this.noOfImages) % this.noOfImages;
  }

  nextSlide() {
    this.currentIndexOfImageSlider = (this.currentIndexOfImageSlider + 1) % this.noOfImages;
  }

  // File input operations: select
  onFileSelected(event: any) {
    const files: FileList = event.target.files;
    if (files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        this.displaySelectedImage(file);
        this.selectedFiles.push({ file, url: URL.createObjectURL(file) });
      }
    }
  }

  // File input operations: display
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


  // File input operations: remove
  onImageRemoved(index: number) {
    this.selectedFiles.splice(index, 1);
    if (this.selectedFiles.length === 0) {
      this.resetImageInput();
    }
  }

  // File input operations: reset
  resetImageInput() {
    this.selectedFiles = [];
    const fileInput: HTMLInputElement | null = document.querySelector('#fileInput');
    if (fileInput) {
      fileInput.value = '';
    }
    this.previewUrl = null;
  }

  // Save each selected image file to the product
  saveEachSelectedFile(productId: string, index: number) {
    if (index < this.selectedFiles.length) {
      const file = this.selectedFiles[index].file;
      const formData = new FormData();
      formData.append('productId', productId);
      formData.append('file', file);
  
      this.mediaService.uploadMedia(formData).subscribe({
        next: (result) => {;
          this.getProductImages(this.product.id);
          this.saveEachSelectedFile(productId, index + 1);
          this.selectedFiles = [];
          this.previewUrl = null;

        },
        error: (error) => {
          if (error.status == 400) {
            if (error.error.message) {
              this.toastr.error(error.error.message);
            } else if (error.error) {
              this.toastr.error(error.error[0]);
            } else {
              this.toastr.error('Something went wrong');
            }
          } else if (error.status === 403) {
            this.toastr.error('Session expired. Log-in again.');
            this.dialogRef.close();
            this.router.navigate(['../login']);
          }
          console.log(error);
          this.previewUrl = null;
          this.selectedFiles = [];
          console.log("this.noOfImages: ", this.noOfImages)
        },
      });
    } else {
      this.toastr.success('Images uploaded successful');
      this.isAddingImages = false;
      this.isEditingImages = false;
      this.editingField = '';
    }
  }

  // Close modal
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