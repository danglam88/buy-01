import { AbstractControl, ValidatorFn } from '@angular/forms';

export class ValidationService {
   greaterThanZeroValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = parseFloat(control.value);
      if (isNaN(value) || value <= 0) {
        return { greaterThanZero: true };
      }
      return null;
    };
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
