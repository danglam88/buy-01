import { inject } from "@angular/core";
import {
  Router,
  CanActivateFn,
} from "@angular/router";
import { AuthenticationService } from "../services/authentication.service";
import { EncryptionService } from "../services/encryption.service"; // Import EncryptionService

export const AuthenticateGuard: CanActivateFn = () => {
  const service = inject(AuthenticationService);
  const router = inject(Router);
  const encryptionService = inject(EncryptionService);

  // Decrypt the loggedIn value from localStorage
  const encryptedLoggedIn = localStorage.getItem("loggedIn");
  if (encryptedLoggedIn) {
   
    const loggedIn = encryptionService.decrypt(encryptedLoggedIn);

    if (loggedIn === "true") {
      service.loggedIn = true;
      return true;
    } 
  }
  return router.parseUrl("/login");
};
