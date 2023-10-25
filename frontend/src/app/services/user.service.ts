import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EncryptionService } from '../services/encryption.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private userInfoUrl="http://localhost:8080/users/userInfo";
  private updateUserUrl="http://localhost:8080/users/";
  private deleteUserUrl="http://localhost:8080/users/";
  private avatarUserUrl="http://localhost:8080/users/avatar/";

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

    return this.httpClient.get(`${this.userInfoUrl}`, { headers });
  }

  updateUser(user: any, id: string): Observable<object> {
    let headers = new HttpHeaders();
    if (this.token) {
      headers = headers.set('Authorization', `Bearer ${this.token}`);
    }

    return this.httpClient.put(`${this.updateUserUrl}` + id, user, { headers });
  }

  deleteUser(user: any): Observable<object> {
    let headers = new HttpHeaders();
    if (this.token) {
      headers = headers.set('Authorization', `Bearer ${this.token}`);
    }

    return this.httpClient.delete(`${this.deleteUserUrl}` + user.id, { headers });
  }

  getUserAvatar(userId: string): Observable<Blob> {
    let headers = new HttpHeaders();
    if (this.token) {
      headers = headers.set('Authorization', `Bearer ${this.token}`);
    }

    return this.httpClient.get(`${this.avatarUserUrl}` + userId , { headers, responseType: 'blob' });
  }

}

