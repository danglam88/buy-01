import { Component, OnInit, Input, Inject, ViewChild, ElementRef } from '@angular/core';
import { Product } from '../../Models/Product';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UpdateProductService } from 'src/app/services/update-product.service';
import { DeleteProductService } from 'src/app/services/delete-product.service';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';

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
  productDetailForm: FormGroup;
  @ViewChild('nameInput') nameInput: ElementRef;
  @ViewChild('priceInput') priceInput: ElementRef;
  @ViewChild('quantityInput') quantityInput: ElementRef;
  @ViewChild('descriptionInput') descriptionInput: ElementRef;

  constructor(
    private updateProductService: UpdateProductService,
    private deleteProductService: DeleteProductService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ProductDetailComponent>,
    private builder: FormBuilder,
    private toastr: ToastrService,
    private dialog: MatDialog
  ) {
    this.product = data.product;
    this.toastr.toastrConfig.positionClass = 'toast-bottom-right';
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
  }

  updateField(field: string): void {
    if (this.productDetailForm.controls[field].invalid) {
      this.displayError(field);
      return;
    }

    // Update the product information
    this.product[field] = this.productDetailForm.controls[field].value;
    this.updateProductService.updateProduct(this.product).subscribe({
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
    console.log("editing field: " + this.editingField);
    setTimeout(() => {
      this[field + 'Input'].nativeElement.focus();
    });
  }

  cancelFieldEdit(): void {
    this.editingField = null;
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
      data: { isDeleteProduct: true } 
    });

    dialogRef.afterClosed().subscribe((confirm: boolean) => {
      if (confirm) {
        console.log('Product deleted');
        this.deleteProductService.deleteProduct(this.product).subscribe({
          next: (result) => {
            console.log(result);
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
}
