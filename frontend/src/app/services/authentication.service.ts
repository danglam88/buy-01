import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router} from '@angular/router';

import { environment } from '../../environments/environment';
import { EncryptionService } from './encryption.service';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  constructor (
    private httpClient: HttpClient,
    private encryptionService: EncryptionService,
    private router: Router
  ) { }
  
  authenticate(user: any): Observable<object> {
    return this.httpClient.post(`${environment.authUrl}`, user);
  }

  loggedIn = false;
    isAuthenticated() {
        const promise = new Promise(
            (resolve, reject) => {
                setTimeout(() => {
                    resolve(this.loggedIn);
                }, 800);
            }
        );
        return promise;
    }

    login() {
        this.loggedIn = true;
    }

    logout() {
        localStorage.setItem('loggedIn', this.encryptionService.encrypt('false'));
    }
}
