import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import {HttpClient, HttpHeaders, HttpParams, HttpResponse} from '@angular/common/http';
import { Observable ,  throwError } from 'rxjs';

import { JwtService } from './jwt.service';
import { catchError } from 'rxjs/operators';
import {parseHttpResponse} from 'selenium-webdriver/http';

@Injectable({
    providedIn: 'root',
})
export class ApiService {
    constructor(
        private http: HttpClient,
    ) {}



    private formatErrors(error: any) {
        return  throwError(error.error);
    }

    get<T>(path: string, httpParams: HttpParams = new HttpParams(), httpHeaders: HttpHeaders = new HttpHeaders()): Observable<any> {
        console.log('headres ' + httpHeaders.keys())
        console.log('headre auth in get template in api service = ' + httpHeaders.get('Authorization'))
        return this.http.get(`${environment.api_url}${path}`, { params: httpParams, headers: httpHeaders })
            .pipe(catchError(this.formatErrors));
    }








    getGeoLocation<T>(httpParams: HttpParams = new HttpParams(), httpHeaders: HttpHeaders = new HttpHeaders()): Observable<any> {
        return this.http.get(environment.geolocation_base_url, { params: httpParams, headers: httpHeaders })
            .pipe(catchError(this.formatErrors));
    }

    put(path: string, httpParams: HttpParams = new HttpParams(), httpHeaders: HttpHeaders = new HttpHeaders(), body: Object = {}): Observable<any> {
        return this.http.put(
            `${environment.api_url}${path}`,
            JSON.stringify(body)
        ).pipe(catchError(this.formatErrors));
    }

    post1(path: string, body: Object, httpHeaders: HttpHeaders): Observable<any> {
       // console.log(httpHeaders.get('Authorization'));
        console.log(httpHeaders.get('Access-Control-Allow-Origin'));
        console.log(httpHeaders.keys());
        console.log(path);
        return this.http.post<HttpResponse<any>>(
            `${environment.api_url}${path}`,
            body,
            {headers: httpHeaders,
                     observe: 'response'},
        ).pipe(catchError(this.formatErrors));
    }



    post(path: string, httpParams: HttpParams, httpHeaders: HttpHeaders, body: Object): Observable<any> {
        console.log(httpHeaders.get('Authorization'));
        console.log(httpHeaders.keys());
        console.log(path);
        return this.http.post<HttpResponse<any>>(
            `${environment.api_url}${path}`,
                   body,
            {headers: httpHeaders,
                observe: 'response'},
        ).pipe(catchError(this.formatErrors));
    }

    postNoResponse(path: string, httpHeaders: HttpHeaders): Observable<any> {

        console.log(httpHeaders.get('Authorization'));
        console.log(httpHeaders.keys());
        console.log(path);
        return this.http.post<HttpResponse<any>>(
            `${environment.api_url}${path}`,
            null,
            {headers: httpHeaders, observe: 'response'},
        ).pipe(catchError(this.formatErrors));
    }


    post2(path: string, httpParams: HttpParams, httpHeaders: HttpHeaders, body: Object): Observable<any> {
        return this.http.post(
            `${environment.api_url}${path}`,
            body,
            {headers: httpHeaders},
        ).pipe(catchError(this.formatErrors));
    }

    delete(path: string, httpParams: HttpParams = new HttpParams(), httpHeaders: HttpHeaders = new HttpHeaders()): Observable<any> {
        return this.http.delete(
            `${environment.api_url}${path}`,
            {params: httpParams, headers: httpHeaders}
        ).pipe(catchError(this.formatErrors));
    }
}
