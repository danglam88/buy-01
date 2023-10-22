import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private userInfoUrl="https://localhost:8443/users/userInfo";
  private updateUserUrl="https://localhost:8443/users/";
  private deleteUserUrl="https://localhost:8443/users/";
  private avaterUserUrl="https://localhost:8443/users/avatar/";
  private token = sessionStorage.getItem('token');

  constructor(private httpClient: HttpClient) { }

  getUserInfo(): Observable<object> {
    let headers = new HttpHeaders();
    if (this.token) {
      headers = headers.set('Authorization', `Bearer ${this.token}`);
    }

    return this.httpClient.get(`${this.userInfoUrl}`, { headers });
  }

  updateUser(user: any, id: string): Observable<object> {
    console.log("user", user)
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

    return this.httpClient.get(`${this.avaterUserUrl}` + userId , { headers, responseType: 'blob' });
  }

}

