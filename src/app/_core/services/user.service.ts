import {Injectable} from '@angular/core';
import {Observable, of, throwError} from 'rxjs';
import {HttpClient, HttpHeaders, HttpParams, HttpResponse} from '@angular/common/http';
import {ReplaySubject} from 'rxjs/ReplaySubject';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/do';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {ApiService} from './api.service';
import {JwtService} from './jwt.service';
import {User} from '../models/admin-user.model';
import {environment} from '../../../environments/environment';
import {UserLoginCredentials, UserRegisterCredentials} from '../../_shared/models/user-credentials.model';
import {CONSTANTS} from '../../_shared/CONSTANTS';
import {ROLE} from '../../_shared/enums/ROLE';
import {RouteInfo} from '../interfaces/route-info.interface';
import {map} from 'rxjs/operators';
import {LoginCredentials, RegisterCredentials} from '../../_shared/interfaces/credentials.interface';
import {Routes, RouterModule, Router} from '@angular/router';


@Injectable({
    providedIn: 'root',
})
export class UserService {
    private currentUserSubject = new BehaviorSubject<User>(User.EMPTY_MODEL);
    private _currentUser = this.currentUserSubject.asObservable().distinctUntilChanged();

    private isAuthenticatedSubject = new ReplaySubject<boolean>(1);
    public isAuthenticated = this.isAuthenticatedSubject.asObservable();

    constructor(
        private readonly apiService: ApiService,
        private readonly http: HttpClient,
        private readonly jwtService: JwtService,
        private readonly router: Router,
    ) {
        console.log('Init User Service');
    }

    // Verify JWT in localstorage with server & load user's info.
    // This runs once on application startup.
    public populate(): void  {
        // If JWT detected, attempt to get & store user's info

        if ((this.jwtService.getToken()) && (this.jwtService.getTrimToken() !== undefined)) {
            // this is getting user object   (should use users url)
            console.log('get token method called while attempting to populate = ' + this.jwtService.getToken());
            const header = new HttpHeaders({'Content-Type': CONSTANTS.DEFAULT_CONTENT_TYPE, 'Authorization': this.jwtService.getToken(), 'Accept': '*', 'Access-Control-Allow-Origin': '*'});
           //  header.append('Content-Type', CONSTANTS.DEFAULT_CONTENT_TYPE);
           //  header.append('Authorization', this.jwtService.getToken());
           //  header.append('Accept', CONSTANTS.DEFAULT_CONTENT_TYPE);
           //  header.append('Access-Control-Allow-Origin', '*');

            this.apiService.postNoResponse(environment.user_sign_in_url, header).subscribe(

                    data => {
                        const body = data.body;
                        // this.setAuth(data.adminUser);
                        console.log( 'The data here = ' + body.token);
                        console.log( 'The data here = ' + data.status);
                        console.log( 'The data here = ' + body.Authority);
                        const recievedUser  = new User(body.user.firstName, body.user.lastName, body.user.userName,'something', ROLE.FULL_ADMIN, this.jwtService.getTrimToken(), '631-965-6774');
                        console.log(recievedUser);
                        this.setAuth(recievedUser);
                    },
                    err => {console.log('error processing the call popoulate')
                          this.purgeAuth()
                       }

                );
        } else {
            // Remove any potential remnants of previous auth states
            console.log('No token detected. Purging Auth');
                this.purgeAuth();
        }
    }

    public setAuth(adminUser: User): void {
        // Save JWT sent from server contained in cookie
        this.jwtService.saveToken(adminUser.token);
        // Set current user data into observable
        this.currentUserSubject.next(adminUser);
        // Set isAuthenticated to true
        this.isAuthenticatedSubject.next(true);
    }





    public get currentUser(): Observable<User> {
        return this._currentUser;
    }

    public getCurrentUserValue(): User {
        return this.currentUserSubject.getValue();
    }

    public getToken(): string {
        return this.currentUserSubject.getValue().token;
    }

    public purgeAuth() {
        console.log('PURGE AUTH CALLED');
        // Remove JWT from localstorage
        this.jwtService.destroyToken();
        // Set current user to an empty object
        this.currentUserSubject.next(User.EMPTY_MODEL);
        // Set auth status to false
        this.isAuthenticatedSubject.next(false);

        this.router.navigateByUrl('/login');
    }

    // WARNING: This method contains test code -- NOT FINAL

    // this method will post to sign up the user taking in credentials from the form
    public attemptRegistryAuth(credentials: RegisterCredentials) {
        // Delete or comment out when testing real API calls
        // return this.fakeRegisterResponse(credentials).pipe(
        //     map(user => {
        //         if (user.token) {
        //             this.setAuth(user);
        //             return user;
        //         } else {
        //             console.log('Auth attempt failure');
        //             console.log('Throwing error');
        //             throw throwError(new Error('Invalid Registry'));
        //         }
        //     })
        // );

        // Uncomment this to test API call for LOGIN
       const httpHeaders = new HttpHeaders();
       httpHeaders.set('Content-Type', 'application/json');
       // httpHeaders.set('Accept', CONSTANTS.DEFAULT_CONTENT_TYPE);
        httpHeaders.set('Access-Control-Allow-Origin', '*');
        return this.apiService.post1(environment.register_url, credentials, httpHeaders).pipe(
            map(
                data => {
                    console.log('the attemptregister 1 call is working');
                    const body = data.body;
                    console.log('the attempt call is working');
                    console.log('the body ' + body);
                    console.log('the body.resp' + body.data);
                   // this.setAuth(data.adminUser);
                    return body;
                }
            )
        );
    }

    // WARNING: This method contains test code -- NOT FINAL
    public attemptLoginAuth(credentials: LoginCredentials): Observable<User> {

        // Delete or comment out when testing real API calls
        // return this.fakeLoginResponse(credentials).pipe(
        //     map(user => {
        //         if (user.token) {
        //             this.setAuth(user);
        //             return user;
        //         } else {
        //             console.log('Auth attempt failure');
        //             console.log('Throwing error');
        //             throw throwError(new Error('Invalid Login'));
        //         }
        //     })
        // );

        // Uncomment this to test API call for REGISTER
        const httpHeaders = new HttpHeaders();
        httpHeaders.set('Content-Type', CONSTANTS.DEFAULT_CONTENT_TYPE);

        httpHeaders.set('Authorization', this.jwtService.getToken()); // { Authorization: Bearer Token [TOKEN] }

        return this.apiService.post1(environment.signIn_url, credentials, httpHeaders).pipe(
            map(
                data => {
                     const body = data.body;
                    // this.setAuth(data.adminUser);
                    console.log( 'The data here = ' + body.token);
                    console.log( 'The data here = ' + data.status);
                    console.log( 'The data here = ' + body.Authority);
                   // console.log(data.firstName);
                    const recievedUser  = new User(body.firstName, body.lastName, body.userName,"something", ROLE.FULL_ADMIN, body.token, '631-965-6774');
                    console.log(recievedUser);
                    this.setAuth(recievedUser);
                    return recievedUser;
                }
            )
        );
    }

    // TEST METHOD
    private fakeLoginResponse(credentials: UserLoginCredentials): Observable<User> {
        if (credentials.email === CONSTANTS.VALID_USER.email && credentials.password === CONSTANTS.VALID_USER.password) {
            console.log('Attempt success. Logging in.');
            return of(CONSTANTS.VALID_USER);
        } else {


        }
    }

    // TEST METHOD
    private fakeRegisterResponse(credentials: UserRegisterCredentials): Observable<User> {
        console.log('Submitted Register credentials: ', credentials);
        if (credentials.registryCode === CONSTANTS.REGISTRY_CODE) {
            console.log('Attempt success. Registering User.');
            return of(CONSTANTS.VALID_USER);
        } else {
            console.log('Attempt failure. Redirecting to Login.');
            console.log('Throwing error');
            throw throwError(new Error('Invalid Registry'));
        }
    }

    // Update the user on the server (email, pass, etc)
    public update(user: User): Observable<User> {
        return this.apiService
            .post1(environment.assets_url_base + user.firstName + '-user-object.json', user, new HttpHeaders()).pipe( // TODO Look into this
                map(_user => {
                    // Update the currentUser observable
                    this.currentUserSubject.next(_user);
                    return _user;

                }));
    }

    public getAllowedRoutes(): RouteInfo[] {
        const currentUserRole = this.currentUserSubject.getValue().role;
        if (currentUserRole !== ROLE.FIELD_WORKER) {
            return CONSTANTS.ADMIN_ROUTES.concat(CONSTANTS.BASE_ROUTES);
        } else if (currentUserRole === ROLE.FIELD_WORKER) {
            return CONSTANTS.BASE_ROUTES;
        } else {
            console.warn('Error setting ROUTES');
        }
    }
}