import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { EncryptionService } from '../services/encryption.service';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private userInfoRoleSource = new BehaviorSubject<string>('');
  userInfoRole$ = this.userInfoRoleSource.asObservable();
  
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
  
  // Get logged in user info
  getUserInfo(): Observable<object> {
    let headers = new HttpHeaders();
    if (this.token) {
      headers = headers.set('Authorization', `Bearer ${this.token}`);
    }

    return this.httpClient.get(`${environment.userInfoUrl}`, { headers });
  }

  // Get a buyer/seller info by id
  getUserById(id: string): Observable<object> {
    let headers = new HttpHeaders();
    if (this.token) {
      headers = headers.set('Authorization', `Bearer ${this.token}`);
    }

    return this.httpClient.get(`${environment.userUrl}` + id, { headers });
  }

  // Update logged in user info
  updateUser(user: any, id: string): Observable<object> {
    let headers = new HttpHeaders();
    if (this.token) {
      headers = headers.set('Authorization', `Bearer ${this.token}`);
    }

    return this.httpClient.put(`${environment.userUrl}` + id, user, { headers });
  }

  // Delete logged in user
  deleteUser(user: any): Observable<object> {
    let headers = new HttpHeaders();
    if (this.token) {
      headers = headers.set('Authorization', `Bearer ${this.token}`);
    }

    return this.httpClient.delete(`${environment.userUrl}` + user.id, { headers });
  }

  // Get logged in user avatar
  getUserAvatar(userId: string): Observable<Blob> {
    let headers = new HttpHeaders();
    if (this.token) {
      headers = headers.set('Authorization', `Bearer ${this.token}`);
    }

    return this.httpClient.get(`${environment.avatarUserUrl}` + userId , { headers, responseType: 'blob' });
  }

  // Set logged in user role
  setUserInfoRole(role: string): void {
    this.userInfoRoleSource.next(role);
  }

  getUserInfoRole(): string {
    const encryptedSecret = sessionStorage.getItem("srt");
    if (encryptedSecret) {
      try {
        const role = JSON.parse(
          this.encryptionService.decrypt(encryptedSecret)
        )["role"];
        return role;
      } catch (error) {
        console.log(error);
      }
    }
    return "";
  }
}

