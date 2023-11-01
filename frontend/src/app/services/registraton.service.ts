import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RegistratonService {
  constructor(private httpClient: HttpClient) { }

  register(user: any): Observable<object> {
    return this.httpClient.post(`${environment.regUrl}`, user);
  }
}
