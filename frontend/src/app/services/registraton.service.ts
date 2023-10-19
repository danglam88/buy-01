import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RegistratonService {
  constructor(private httpClient: HttpClient) { }

  private regUrl="https://localhost:8443/reg";

  register(user: any): Observable<object> {
    return this.httpClient.post(`${this.regUrl}`, user);
  }
}
