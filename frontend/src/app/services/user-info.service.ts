import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserInfoService {

  constructor(private httpClient: HttpClient) { }

  private userInfoUrl="http://localhost:8080/users/userInfo";

  getUserInfo(): Observable<object> {
    // Retrieve the token from sessionStorage
    const token = sessionStorage.getItem('token');

    // Create headers with Authorization Bearer token if the token is available
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return this.httpClient.get(`${this.userInfoUrl}`, { headers });
  }
}
