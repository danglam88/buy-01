import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient, HttpHeaders  } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EncryptionService } from '../services/encryption.service';

@Injectable({
  providedIn: 'root'
})
export class MediaService {
  private uploadMediaUrl="https://localhost:8445/media";
  private mediaByProductIdUrl="https://localhost:8445/media/product/";
  private deleteMediaUrl="https://localhost:8445/media/";
  private mediaByMediaIdUrl="https://localhost:8445/media/";
  private token = sessionStorage.getItem('token');
  productMediaUpdated = new EventEmitter<any>();

  constructor(private httpClient: HttpClient,
    private encryptionService: EncryptionService) { 
    const encryptedToken = sessionStorage.getItem('token');
    if (encryptedToken) {
      this.token = this.encryptionService.decrypt(encryptedToken);
    }
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
