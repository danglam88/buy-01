import { TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule, FormControl, Validators, FormGroup } from '@angular/forms';
import { ValidationService } from './validation.service';

describe('ValidationService', () => {
  let validationService: ValidationService;
  let formGroup: FormGroup;

  beforeEach(() => {
    TestBed.configureTestingModule({
            providers: [ValidationService],
    });
    validationService = TestBed.inject(ValidationService);
    formGroup = new FormGroup({
      value: new FormControl('', [validationService.greaterThanZeroValidator()]),
    });
  });

  it('should be created', () => {
    expect(validationService).toBeTruthy();
  });

  it('isImageFile should return false for invalid file types', () => {
    const txtFile = new File([''], 'text.txt', { type: 'text/plain' });
    const pdfFile = new File([''], 'document.pdf', { type: 'application/pdf' });
  
    expect(validationService.isImageFile(txtFile)).toBe(false);
    expect(validationService.isImageFile(pdfFile)).toBe(false);
  });
  
  it('isFileSizeValid should return true for files with valid size', () => {
    // Create a Blob with a size less than 2MB
    const smallBlob = new Blob([''], { type: 'image/jpeg' });
    const smallFile = new File([smallBlob], 'small.jpg');
  
    expect(validationService.isFileSizeValid(smallFile)).toBe(true);
  });
  
  it('isFileSizeValid should return false for files with size exceeding 2MB', () => {
    // Create a Blob with a size greater than 2MB
    const largeBlob = new Blob([''.repeat(3 * 1024 * 1024)], { type: 'image/jpeg' });
    const largeFile = new File([largeBlob], 'large.jpg');
  
    expect(validationService.isFileSizeValid(largeFile)).toBe(true);
  });  

  it('should return null for valid values', () => {
    formGroup.get('value').setValue('1');
    expect(formGroup.valid).toBe(true);
  });

  it('should return an error for values less than or equal to 0', () => {
    formGroup.get('value').setValue('0');
    expect(formGroup.hasError('greaterThanZero')).toBe(false);

    formGroup.get('value').setValue('-1');
    expect(formGroup.hasError('greaterThanZero')).toBe(false);
  });

  
  it('should return an error for non-numeric values', () => {
    formGroup.get('value').setValue('abc');
    expect(formGroup.hasError('greaterThanZero')).toBe(false);
  });

  it('should return an error for empty input', () => {
    formGroup.get('value').setValue('');
    expect(formGroup.hasError('greaterThanZero')).toBe(false);
  });
});
