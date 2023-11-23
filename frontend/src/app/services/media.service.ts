import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient, HttpHeaders  } from '@angular/common/http';
import { EncryptionService } from '../services/encryption.service';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MediaService {
  mediaUpload = new EventEmitter<any>();
  mediaDeleted = new EventEmitter<any>();

  constructor(
    private httpClient: HttpClient,
    private encryptionService: EncryptionService, 
    private router: Router,
  ) { }

  get token() : string {
    const encryptedSecret = sessionStorage.getItem('srt');
    if (encryptedSecret) {
      try {
        const currentToken = JSON.parse(this.encryptionService.decrypt(encryptedSecret))["token"];
        return currentToken;
      } catch (error) {
        this.router.navigate(['../login']);
      }
    }
    return '';
  }
 
  getImageByProductId(productId: any): Observable<object> {
    let headers = new HttpHeaders();
    if (this.token) {
      headers = headers.set('Authorization', `Bearer ${this.token}`);
    }

    return this.httpClient.get(`${environment.productMediaUrl}` + productId,  { headers });
  }

  getImageByMediaId(mediaId: any): Observable<Blob> {
    let headers = new HttpHeaders();
    if (this.token) {
      headers = headers.set('Authorization', `Bearer ${this.token}`);
    }
    return this.httpClient.get<Blob>(`${environment.mediaUrl}/` + mediaId, { headers: headers, responseType: 'blob' as 'json' })
    
  }

  uploadMedia(media: any): Observable<object> {
    let headers = new HttpHeaders();
    if (this.token) {
      headers = headers.set('Authorization', `Bearer ${this.token}`);
    }
    return this.httpClient.post(`${environment.mediaUrl}`,  media, { headers });
  }

  deleteMedia(mediaId: any): Observable<object> {
    let headers = new HttpHeaders();
    if (this.token) {
      headers = headers.set('Authorization', `Bearer ${this.token}`);
    }
    return this.httpClient.delete(`${environment.mediaUrl}/` + mediaId, { headers });
  }
}
