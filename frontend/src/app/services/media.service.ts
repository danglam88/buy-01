import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient, HttpHeaders  } from '@angular/common/http';
import { EncryptionService } from '../services/encryption.service';
import { AuthenticationService } from '../services/authentication.service';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MediaService {
  mediaUpload = new EventEmitter<any>();
  mediaDeleted = new EventEmitter<any>();

  constructor(
    private httpClient: HttpClient,
    private encryptionService: EncryptionService,
    private authService: AuthenticationService
  ) { }

  get token() : string {
    const encryptedSecret = localStorage.getItem('srt');
    if (encryptedSecret) {
      try {
        const currentToken = JSON.parse(this.encryptionService.decrypt(encryptedSecret))["token"];
        return currentToken;
      } catch (error) {
        this.authService.logout();
      }
    }
    return '';
  }
  
  // Get media by product id
  getImageByProductId(productId: any): Observable<object> {
    let headers = new HttpHeaders();
    if (this.token) {
      headers = headers.set('Authorization', `Bearer ${this.token}`);
    }

    return this.httpClient.get(`${environment.productMediaUrl}` + productId,  { headers });
  }

  // Get image by media id
  getImageByMediaId(mediaId: any): Observable<Blob> {
    let headers = new HttpHeaders();
    if (this.token) {
      headers = headers.set('Authorization', `Bearer ${this.token}`);
    }
    return this.httpClient.get<Blob>(`${environment.mediaUrl}/` + mediaId, { headers: headers, responseType: 'blob' as 'json' })
    
  }

  // Upload media
  uploadMedia(media: any): Observable<object> {
    let headers = new HttpHeaders();
    if (this.token) {
      headers = headers.set('Authorization', `Bearer ${this.token}`);
    }
    return this.httpClient.post(`${environment.mediaUrl}`,  media, { headers });
  }

  // Delete media
  deleteMedia(mediaId: any): Observable<object> {
    let headers = new HttpHeaders();
    if (this.token) {
      headers = headers.set('Authorization', `Bearer ${this.token}`);
    }
    return this.httpClient.delete(`${environment.mediaUrl}/` + mediaId, { headers });
  }
}
