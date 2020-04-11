import { Injectable } from '@angular/core';
import {CookieService} from 'ngx-cookie';
import {CONSTANTS} from '../../_shared/CONSTANTS';

@Injectable({
    providedIn: 'root',
})
export class JwtService {

    constructor(private readonly cookieService: CookieService) {}

    getToken(): string {
        
            
            if (this.cookieService.get(CONSTANTS.TOKEN_KEY_NAME) !== undefined)
            
            return 'Bearer ' + this.cookieService.get(CONSTANTS.TOKEN_KEY_NAME);  // change to cookie
          
          else {
              
              return this.cookieService.get(CONSTANTS.TOKEN_KEY_NAME);
            }
    
    }

    getTrimToken(): string {
        return ( this.cookieService.get(CONSTANTS.TOKEN_KEY_NAME)); // change to cookie
    }

    saveToken(token: string) {
        this.cookieService.put(CONSTANTS.TOKEN_KEY_NAME, token);
    }

    destroyToken() {
        this.cookieService.remove(CONSTANTS.TOKEN_KEY_NAME);
    }

}
