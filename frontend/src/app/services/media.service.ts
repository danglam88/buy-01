import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient, HttpHeaders  } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EncryptionService } from '../services/encryption.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class MediaService {
  private uploadMediaUrl="http://localhost:8082/media";
  private mediaByProductIdUrl="http://localhost:8082/media/product/";
  private deleteMediaUrl="http://localhost:8082/media/";
  private mediaByMediaIdUrl="http://localhost:8082/media/";
  productMediaUpdated = new EventEmitter<any>();
  productMediaDeleted = new EventEmitter<any>();

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

    return this.httpClient.get(`${this.mediaByProductIdUrl}` + productId,  { headers });
  }

  getImageByMediaId(mediaId: any): Observable<Blob> {
    let headers = new HttpHeaders();
    if (this.token) {
      headers = headers.set('Authorization', `Bearer ${this.token}`);
    }
    return this.httpClient.get<Blob>(`${this.mediaByMediaIdUrl}` + mediaId, { headers: headers, responseType: 'blob' as 'json' })
    
  }

  uploadMedia(media: any): Observable<object> {
    let headers = new HttpHeaders();
    if (this.token) {
      headers = headers.set('Authorization', `Bearer ${this.token}`);
    }
    return this.httpClient.post(`${this.uploadMediaUrl}`,  media, { headers });
  }

  deleteMedia(mediaId: any): Observable<object> {
    let headers = new HttpHeaders();
    if (this.token) {
      headers = headers.set('Authorization', `Bearer ${this.token}`);
    }
    return this.httpClient.delete(`${this.deleteMediaUrl}` + mediaId, { headers });
  }
}
