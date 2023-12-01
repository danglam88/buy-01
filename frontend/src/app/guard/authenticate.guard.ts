import { inject } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  CanActivateFn,
} from "@angular/router";
import { AuthenticationService } from "../services/authentication.service";
import { EncryptionService } from "../services/encryption.service"; // Import EncryptionService

export const AuthenticateGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const service = inject(AuthenticationService);
  const router = inject(Router);
  const encryptionService = inject(EncryptionService);

  // Decrypt the loggedIn value from sessionStorage
  const encryptedLoggedIn = sessionStorage.getItem("loggedIn");
  console.log("encryptedLoggedIn", encryptedLoggedIn);
  if (encryptedLoggedIn) {
   
    const loggedIn = encryptionService.decrypt(encryptedLoggedIn);

    if (loggedIn === "true") {
      service.loggedIn = true;
      return true;
    } 

  }
  return router.parseUrl("/login");
};
