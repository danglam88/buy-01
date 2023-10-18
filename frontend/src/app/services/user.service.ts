import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private userInfoUrl="http://localhost:8080/users/userInfo";
  private updateUserUrl="http://localhost:8080/users/";
  private deleteUserUrl="http://localhost:8080/users/";
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
}

