import {
  Component,
  OnInit,
  Input,
  Inject,
  ViewChild,
  ElementRef,
  EventEmitter,
  Output,
} from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { Router } from "@angular/router";

import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialog,
} from "@angular/material/dialog";
import { ToastrService } from "ngx-toastr";

import { ProductService } from "src/app/services/product.service";
import { MediaService } from "src/app/services/media.service";
import { EncryptionService } from "src/app/services/encryption.service";
import { ValidationService } from "src/app/services/validation.service";
import { ErrorService } from "src/app/services/error.service";

import { Product } from "../../Models/Product";
import { ConfirmationDialogComponent } from "../confirmation-dialog/confirmation-dialog.component";
import { CartService } from "src/app/services/cart.service";
import { Observable, catchError, forkJoin, of, switchMap } from 'rxjs';
import { Media } from 'src/app/Models/Media';

@Component({
  selector: "product-detail",
  templateUrl: "./product-detail.component.html",
  styleUrls: ["./product-detail.component.css"],
})
export class ProductDetailComponent implements OnInit {
  @Input() product: Product;
  @Output() mediaArray$: Observable<Media[]>;
  view: string = '';
  @Output() productAdded = new EventEmitter();
  editingField: string | null = null;
  productImages: any = {};
  mediaID: any = {};
  productDetailForm: FormGroup;
  noOfImages: number;
  selectedFiles: Array<{ file: File; url: string }> = [];
  previewUrl: string | ArrayBuffer | null = null;
  isAddingImages = false;
  isDeletingImages = false;
  isEditingImages = false;
  isAddingToCart = false;
  noProductsAvailble = false;
  currentIndexOfImageSlider = 0;
  imgPlaceholder = "../../../../assets/images/uploadPhoto.jpg";
  selectedQuantity = 1;
  @ViewChild("nameInput") nameInput: ElementRef;
  @ViewChild("priceInput") priceInput: ElementRef;
  @ViewChild("quantityInput") quantityInput: ElementRef;
  @ViewChild("descriptionInput") descriptionInput: ElementRef;

  constructor(
    private productService: ProductService,
    private mediaService: MediaService,
    private validationService: ValidationService,
    private errorService: ErrorService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ProductDetailComponent>,
    private builder: FormBuilder,
    private toastr: ToastrService,
    private dialog: MatDialog,
    private encryptionService: EncryptionService,
    private router: Router,
    private cartService: CartService
  ) {
    this.product = data.product; // get product details from product-listing component
    //this.toastr.toastrConfig.positionClass = 'toast-bottom-right';

    // Handles product media updates and get product images again from media service
    if (this.mediaService.mediaUpload) {
      this.mediaService.mediaUpload.subscribe(() => {
        this.getProductImages();
        this.currentIndexOfImageSlider = this.noOfImages;
      });
    } 

    if (this.mediaService.mediaDeleted) {
      this.mediaService.mediaDeleted.subscribe(() => {
        this.getProductImages();
        if (this.currentIndexOfImageSlider === this.noOfImages -1 ) {
          this.currentIndexOfImageSlider = 0;
        }
      });
    }
  }

  get userRole(): string {
    const encryptedSecret = sessionStorage.getItem("srt");
    if (encryptedSecret) {
      try {
        const currentToken = JSON.parse(
          this.encryptionService.decrypt(encryptedSecret)
        )["role"];
        return currentToken;
      } catch (error) {
        this.router.navigate(["../login"]);
      }
    }
    return "";
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
        "",
        [
          Validators.required,
          Validators.pattern(/^\d+(\.\d+)?$/),
          Validators.maxLength(10),
          this.validationService.greaterThanZeroValidator(), // Custom validator for price
        ],
      ],
      quantity: [
        "",
        [
          Validators.required,
          Validators.pattern(/^[0-9]+$/),
          Validators.maxLength(10),
          this.validationService.greaterThanZeroValidator(), // Custom validator for quantity
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
    this.getProductImages();  

      // Handles product media updates and get product images again from media service
      
    if (this.mediaService.mediaUpload) {
      this.mediaService.mediaUpload.subscribe(() => {
        this.getProductImages();
        this.currentIndexOfImageSlider = this.noOfImages;
      });
    } 

    if (this.mediaService.mediaDeleted) {
      this.mediaService.mediaDeleted.subscribe(() => {
        this.getProductImages();
        if (this.currentIndexOfImageSlider === this.noOfImages -1 ) {
          this.currentIndexOfImageSlider = 0;
        }
      });
    }
  }

  getProductImages(): void {
    this.getMediaArray(this.product.id);
    this.mediaArray$.subscribe((result) => {
      for (const key in result) {
        if (result.hasOwnProperty(key)) {
          this.productImages[key] = { data: result[key].imageData, mediaId: result[key].mediaId };
        }  
      }
      this.noOfImages = result.length;
    });
  }

  getMediaArray(productId:string): void{
    this.mediaArray$ = this.mediaService.getImageByProductId(productId).pipe(
      switchMap((result) => {
        const mediaObservables = Object.keys(result).map((key) =>
          this.mediaService.getImageByMediaId(result[key]).pipe(
            switchMap((image) => {
              return new Observable<Media>((observer) => {
                const reader = new FileReader();
                reader.onload = () => {
                  const media: Media = {
                    productId: productId,
                    mediaId: result[key],
                    imageData: reader.result,
                  };
                  observer.next(media);
                  observer.complete();
                };
                reader.readAsDataURL(image);
              });
            }),
            catchError((error) => {
              if (this.errorService.isAuthError(error.status)) {
                this.errorService.handleSessionExpirationError();
              }
              return of(null);
            })
          )
        );
        return forkJoin(mediaObservables);
      })
    );
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
        if (this.errorService.isAuthError(error.status)) {
          this.errorService.handleSessionExpirationError();
          this.dialogRef.close();
        } else if (this.errorService.is400Error(error.status)) {
          this.errorService.handleBadRequestError(error);
        } else {
          this.toastr.error(`Product ${field} update failed`);
        }
      },
    });
  }

  // Delete image from product
  deleteImage(currentImage: any) {
    if (currentImage) {
      const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
        data: {
          confirmationText: "Delete this image?",
        },
      });
      dialogRef.afterClosed().subscribe((confirm: boolean) => {
        if (confirm) {
          this.mediaService.deleteMedia(currentImage.mediaId).subscribe({
            next: (result) => {
              this.mediaService.mediaDeleted.emit(true);
              this.toastr.success('Image deleted');
            },
            error: (error) => {
              console.log(error);
              if (this.errorService.isAuthError(error.status)) {
                this.errorService.handleSessionExpirationError();
                this.dialogRef.close();
              }
            },
            complete: () => {
              console.log("Image deleted");
            },
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
      this.toastr.error(
        "Image Limit Exceeded: You can only add a maximum of 5 images"
      );
    } else {
      this.saveEachSelectedFile(this.product.id, 0)
      this.mediaService.mediaUpload.emit(true);
    }
  }

  // Delete the product and handle errors
  deleteProduct(): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        confirmationText: "Delete this product?",
      },
    });

    dialogRef.afterClosed().subscribe((confirm: boolean) => {
      if (confirm) {
        console.log("Product deleted");
        this.productService.deleteProduct(this.product).subscribe({
          next: (result) => {
            this.productService.productDeleted.emit(true);
          },
          error: (error) => {
            if (this.errorService.isAuthError(error.status)) {
              this.errorService.handleSessionExpirationError();
              this.dialogRef.close();
            } else if (this.errorService.is400Error(error.status)) {
              this.errorService.handleBadRequestError(error);
            }
          },
        });
        this.toastr.success("Product deleted");
        this.dialogRef.close();
      }
    });
  }

  // Capture which field is being updated on the productDetailForm and set the editingField to that field
  editProfileField(field: string): void {
    this.editingField = field;
    if (field === "addImages") {
      this.isAddingImages = true;
      this.isDeletingImages = false;
      this.isEditingImages = true;
    } else if (field === "deleteImages") {
      this.isAddingImages = false;
      this.isDeletingImages = true;
      this.isEditingImages = true;
    }
    setTimeout(() => {
      this[field + "Input"]?.nativeElement.focus();
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
    this.currentIndexOfImageSlider = 0;
  }

  // Get the current image from the image slider
  get currentImage(): { url: string; mediaId: string } | null {
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
    this.currentIndexOfImageSlider =
      (this.currentIndexOfImageSlider - 1 + this.noOfImages) % this.noOfImages;
  }

  nextSlide() {
    this.currentIndexOfImageSlider =
      (this.currentIndexOfImageSlider + 1) % this.noOfImages;
  }

  // File input operations: select
  onFileSelected(event: any) {
    const files: FileList = event.target.files;
    if (files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Check the file type (allow only images)
        if (this.validationService.isImageFile(file)) {
          // Check the file size (limit to 2MB)
          if (this.validationService.isFileSizeValid(file)) {
            this.displaySelectedImage(file);
            this.selectedFiles.push({ file, url: URL.createObjectURL(file) });
          } else {
            this.toastr.error(
              "Cannot upload " +
                file.name +
                ". File size exceeds the limit (2MB). Please select a smaller image."
            );
          }
        } else {
          this.toastr.error(
            "Cannot upload " +
              file.name +
              ". Invalid file type. Please select an image (e.g., JPEG, PNG, GIF)."
          );
        }
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
      console.error("Error reading the selected image:", error);
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
    const fileInput: HTMLInputElement | null =
      document.querySelector("#fileInput");
    if (fileInput) {
      fileInput.value = "";
    }
    this.previewUrl = null;
  }

  // Save each selected image file to the product
  saveEachSelectedFile(productId: string, index: number) {
    if (index < this.selectedFiles.length) {
      const file = this.selectedFiles[index].file;
      const formData = new FormData();
      formData.append("productId", productId);
      formData.append("file", file);

      this.mediaService.uploadMedia(formData).subscribe({
        next: (result) => {;
          this.getProductImages();
          this.saveEachSelectedFile(productId, index + 1);
          this.selectedFiles = [];
          this.previewUrl = null;
        },
        error: (error) => {
          if (this.errorService.is400Error(error.status)) {
            this.errorService.handleBadRequestError(error);
          } else if (this.errorService.isAuthError(error.status)) {
            this.errorService.handleSessionExpirationError();
            this.dialogRef.close();
          }
          console.log(error);
          this.previewUrl = null;
          this.selectedFiles = [];
          console.log("this.noOfImages: ", this.noOfImages);
        },
      });
    } else {
      this.toastr.success("Images uploaded successful");
      this.isAddingImages = false;
      this.isEditingImages = false;
      this.editingField = "";
    }
  }

  //TODO: Add to cart button needs to be disabled when the product quantity is 0
  // TODO: Show in view template 'Out of Stock' when product quantity is 0
  addToCart() {
    this.isAddingToCart = true;
    if (this.product) {
      this.cartService.addToCart(this.product).subscribe({
        next: (result) => {
          console.log("add to cart result: ", result);
          console.log("add to cart result.toString(): ", result.toString());

          setTimeout(() => {
            this.cartService.getCartItem(result.toString()).subscribe({
              next: (result) => {
                console.log("Cart item after adding: ", result);
                this.cartService.isItemAddedToCart(true);
              },
              error: (error) => {
                console.log(error);
                this.toastr.error('Item is out of stock');
              },
              complete: () => {
                this.toastr.success('Added to Cart');
              }
            });
          }, 250);
        },
        error: (error) => {
          if (this.errorService.isAuthError(error.status)) {
            this.errorService.handleSessionExpirationError();
            this.dialogRef.close();
          } else if (this.errorService.is400Error(error.status)) {
            this.errorService.handleBadRequestError(error);
          }
        }
      });
    }

    if (this.product.quantity === 0) {
      this.noProductsAvailble = true;
    }
  }

  // Close modal
  closeModal(): void {
    this.dialogRef.close();
  }
}
