import { Component, OnInit, Input, Inject, ViewChild, ElementRef } from '@angular/core';
import { Product } from '../../Models/Product';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ProductService } from 'src/app/services/product.service';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { MediaService } from 'src/app/services/media.service';

@Component({
  selector: 'product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {
  @Input() product: Product;
  isEditingProfile: boolean = false;
  editingField: string | null = null;
  userRole = sessionStorage.getItem('role');
  productImages: any = {};
  mediaID: any = {};
  productDetailForm: FormGroup;
  noOfImages: number;
  userID = sessionStorage.getItem('id');
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
  ) {
    this.product = data.product;
    this.toastr.toastrConfig.positionClass = 'toast-bottom-right';

    this.mediaService.productMediaUpdated.subscribe((productMediaUpdated) => {
      if (productMediaUpdated) {
        this.productImages = {};
        this.getImage(this.product.id);
      }
    });
  }


  ngOnInit(): void {
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
        this.product.price,
        [
          Validators.required,
          Validators.pattern(/^\d+(\.\d+)?$/),
        ],
      ],
      quantity: [
        this.product.quantity,
        [
          Validators.required,
          Validators.pattern(/^[0-9]+$/),
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

    this.getImage(this.product.id);
  }

  getImage(productId: string){
    // Get product images from media service
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
                console.log(error);
              }
            });
          }
        }
        const objectLength = Object.keys(result).length;
        this.noOfImages = objectLength;
        console.log("ln 120 noOfImages: " + this.noOfImages);
        this.currentIndexOfImageSlider = this.noOfImages - 1;
      },
      error: (error) => {
        console.log(error);
      }
    });
  }
  // Capture which field is being updated
  updateField(field: string): void {
    if (this.productDetailForm.controls[field].invalid) {
      this.displayError(field);
      return;
    }
    this.product[field] = this.productDetailForm.controls[field].value;
    this.productService.updateProduct(this.product).subscribe({
      next: (result) => {
        console.log(result);
        this.toastr.success(`Product ${field} updated`, 'Success');
        this.editingField = null;
      },
      error: (error) => {
        this.displayError(`Product ${field} update failed`);
        console.log(error);
      }
    });
  }

  displayError(message: string): void {
    this.toastr.error(message, 'Error');
  }

  editProfileField(field: string): void {
    this.isEditingProfile = true;
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
    console.log("editing field: " + this.editingField);
    setTimeout(() => {
      this[field + 'Input']?.nativeElement.focus();
    });
  }

  cancelFieldEdit(): void {
    this.editingField = null;
    this.isAddingImages = false;
    this.isDeletingImages = false;
    this.isEditingImages = false;
    this.selectedFiles = [];
    this.previewUrl = null;
  }

  cancelEdit(): void {
    this.isEditingProfile = false;
  }

  closeModal(): void {
    this.dialogRef.close();
  }

  // Delete product
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
            console.log(result);
            this.productService.productDeleted.emit(true);
          },
          error: (error) => {
            console.log(error);
            if (error.status == 401) {
              this.toastr.error('Operation not allowed');
            } else if (error.status == 404) {
              this.toastr.error('Product not found');
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

  onFileSelected(event: any) {
    const files: FileList = event.target.files;
    if (files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        this.displaySelectedImage(file);
        this.selectedFiles.push({ file, url: URL.createObjectURL(file) });
      }
    }
    console.log("selectedFiles 1: " + this.selectedFiles);
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
  resetImageInput() {
    this.selectedFiles = [];
    const fileInput: HTMLInputElement | null = document.querySelector('#fileInput');
    if (fileInput) {
      fileInput.value = '';
    }
    this.previewUrl = null;
  }
  onImageRemoved(index: number) {
    this.selectedFiles.splice(index, 1);
    console.log("selectedFiles 2: " + this.selectedFiles)
    console.log("selectedFiles length: " + this.selectedFiles.length)

    if (this.selectedFiles.length === 0) {
      console.log("true")
      this.resetImageInput();
    }
  }

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
              console.log(result);
              this.getImage(this.product.id);
              this.toastr.success('Image deleted');
            },
            error: (error) => {
              console.log(error);
              if (error.status == 401) {
                this.toastr.error('Operation not allowed');
              } else if (error.status == 404) {
                this.toastr.error('Image not found');
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

  saveEditedImages() {
    if (this.selectedFiles.length > 5) {
      this.toastr.error('You can only add a maximum of 5 images', 'Image Limit Exceeded');
    } else {
      this.saveEachSelectedFile(this.product.id, 0)
      this.mediaService.productMediaUpdated.emit(true);
    }
  }

  saveEachSelectedFile(productId: string, index: number) {
    if (index < this.selectedFiles.length) {
      const file = this.selectedFiles[index].file;
      const formData = new FormData();
      formData.append('productId', productId);
      formData.append('file', file);
  
      this.mediaService.uploadMedia(formData).subscribe({
        next: (result) => {;
            // Set currentIndex to the index of the new image
          this.getImage(this.product.id);
          this.saveEachSelectedFile(productId, index + 1);
          this.selectedFiles = [];
          this.previewUrl = null;

        },
        error: (error) => {
          this.toastr.error(error)
        },
      });
    } else {
      this.toastr.success('Images uploaded successful');
      this.isAddingImages = false;
      this.isEditingImages = false;
      this.editingField = '';
    }
  }

}