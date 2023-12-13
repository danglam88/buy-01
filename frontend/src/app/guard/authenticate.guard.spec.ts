// import {fakeAsync, TestBed, tick} from '@angular/core/testing';
// import {
//   ActivatedRouteSnapshot, CanActivateFn,
//   Router,
//   RouterStateSnapshot,
//   UrlSegment,
//   UrlSegmentGroup,
//   UrlTree
// } from '@angular/router';
// import {Observable, of, throwError} from 'rxjs';
// import {AuthenticateGuard} from './authenticate.guard';
// // import {LoginService} from '../services/login.service';

// describe('AuthGuard', () => {
//   //let mockLoginService: jasmine.SpyObj<LoginService>
//   let mockRouter: jasmine.SpyObj<Router>
//   const urlPath = '/dataset'
//   const expectedUrl = 'login';
//   const expectedQueryParams = { loggedOut: true, origUrl: urlPath };

//   beforeEach(async () => {
//     mockLoginService = jasmine.createSpyObj(AuthenticateGuard, ['isLoggedIn'])
//     mockRouter = jasmine.createSpyObj(AuthenticateGuard, ['navigate', 'createUrlTree', 'parseUrl'])
//     mockRouter.parseUrl.and.callFake((url: string) => {
//       const urlTree = new UrlTree()
//       const urlSegment = new UrlSegment( url, {})
//       urlTree.root = new UrlSegmentGroup( [urlSegment], {})
//       return urlTree
//     });
//     await TestBed.configureTestingModule( {
//       providers: [
//         {
//           provide: Router,
//           useValue: mockRouter
//         },
//         {
//           provide: LoginService,
//           useValue: mockLoginService
//         },
//       ]
//     })
//   })

//   it('should return false if the user is not logged in ', fakeAsync(async () => {
//     mockIsLoggedInFalse()
//     const authenticated = await runAuthGuardWithContext(getAuthGuardWithDummyUrl(urlPath))
//     expect(authenticated).toBeFalsy()
//   }))

//   it('should return true if the user is logged in ', fakeAsync(async () => {
//     mockIsLoggedInTrue()
//     const authenticated = await runAuthGuardWithContext(getAuthGuardWithDummyUrl(urlPath))
//     expect(authenticated).toBeTruthy()
//   }))

//   it('should redirect to login with originalUrl and loggedOut url parameters if the user is not logged in ', fakeAsync(async () => {
//     mockIsLoggedInFalse()
//     const authenticated = await runAuthGuardWithContext(getAuthGuardWithDummyUrl(urlPath))
//     expect(mockRouter.createUrlTree).toHaveBeenCalledOnceWith([mockRouter.parseUrl(expectedUrl)],  { queryParams: expectedQueryParams })
//     expect(authenticated).toBeFalsy()
//   }))

//   it('should redirect to login with originalUrl and loggedOut url parameters if catches an error ', fakeAsync(async () => {
//     mockLoginService.isLoggedIn.and.returnValue(throwError(() =>'Authentication error'));
//     const authenticated = await runAuthGuardWithContext(getAuthGuardWithDummyUrl(urlPath))
//     expect(mockRouter.navigate).toHaveBeenCalledOnceWith([expectedUrl],  { queryParams: expectedQueryParams })
//     expect(authenticated).toBeFalsy()
//   }))

//   function getAuthGuardWithDummyUrl(urlPath: string): () => boolean | UrlTree | Promise<boolean | UrlTree> | Observable<boolean | UrlTree> {
//     const dummyRoute = new ActivatedRouteSnapshot( )
//     dummyRoute.url = [ new UrlSegment(urlPath, {}) ]
//     const dummyState: RouterStateSnapshot = { url: urlPath, root:  new ActivatedRouteSnapshot() }
//     return () => AuthGuard(dummyRoute, dummyState)
//   }

//   async function runAuthGuardWithContext(authGuard: () => boolean | UrlTree | Promise<boolean | UrlTree> | Observable<boolean | UrlTree>): Promise<boolean | UrlTree> {
//     const result = TestBed.runInInjectionContext(authGuard)
//     const authenticated = result instanceof Observable ? await handleObservableResult(result) : result;
//     return authenticated
//   }

//   function handleObservableResult(result: Observable<boolean | UrlTree>): Promise<boolean | UrlTree> {
//     return new Promise<boolean | UrlTree>((resolve) => {
//       result.subscribe((value) => {
//         resolve(value);
//       });
//     });
//   }

//   const mockIsLoggedInTrue = () => {
//     mockLoginService.isLoggedIn.and.returnValue(of(true));
//   }

//   const mockIsLoggedInFalse = () => {
//     mockLoginService.isLoggedIn.and.returnValue(of(false));
//   }

// })