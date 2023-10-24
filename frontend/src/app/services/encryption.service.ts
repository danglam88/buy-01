import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EncryptionService {
  encrypt(data: string): string {
    return btoa(data);
  }

  decrypt(data: string): string {
    return atob(data);
  }
}