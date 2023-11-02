import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EncryptionService } from '../services/encryption.service';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(
    private httpClient: HttpClient,
    private encryptionService: EncryptionService, 
    private router: Router,
    ) {}
  
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

  getUserInfo(): Observable<object> {
    let headers = new HttpHeaders();
    if (this.token) {
      headers = headers.set('Authorization', `Bearer ${this.token}`);
    }

    return this.httpClient.get(`${environment.userInfoUrl}`, { headers });
  }

  updateUser(user: any, id: string): Observable<object> {
    let headers = new HttpHeaders();
    if (this.token) {
      headers = headers.set('Authorization', `Bearer ${this.token}`);
    }

    return this.httpClient.put(`${environment.userUrl}` + id, user, { headers });
  }

  deleteUser(user: any): Observable<object> {
    let headers = new HttpHeaders();
    if (this.token) {
      headers = headers.set('Authorization', `Bearer ${this.token}`);
    }

    return this.httpClient.delete(`${environment.userUrl}` + user.id, { headers });
  }

  getUserAvatar(userId: string): Observable<Blob> {
    let headers = new HttpHeaders();
    if (this.token) {
      headers = headers.set('Authorization', `Bearer ${this.token}`);
    }

    return this.httpClient.get(`${environment.avatarUserUrl}` + userId , { headers, responseType: 'blob' });
  }

}

