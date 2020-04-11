import {Injectable} from '@angular/core';
import {Carwash} from '../models/carwash.model';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {DisplayPackageItem} from '../models/display-package-item.model';
import {Package} from '../models/package.model';
import {Promotion} from '../models/promotion.model';
import {SERVICE_TYPE} from '../enums/SERVICE_TYPE';
import {ApiService} from '../../_core/services/api.service';
import {environment} from '../../../environments/environment';
import {pluck, take} from 'rxjs/operators';
import {Store} from '../models/store.model';
import {CONSTANTS} from '../CONSTANTS';
import {CARWASH_COMPONENT} from '../enums/CARWASH_COMPONENT.model';
import {UserService} from '../../_core/services/user.service';
import {
    DeletePackageObject,
    DeletePromotionObject,
    NewStoreObject, PackageArrayObject,
    PackageObject,
    PromotionObject,
    StoreObject
} from '../interfaces/post.interface';
import {JwtService} from '../../_core/services/jwt.service';

@Injectable({
    providedIn: 'root'
})
export class CarwashService {
    public static carwashSubject = new BehaviorSubject(<Carwash>{});
    public static displayPackageItems = of(new Array<DisplayPackageItem>());
    public static carwash: Observable<Carwash> = CarwashService.carwashSubject.asObservable();
    public serviceReady: boolean = false;

    constructor(private readonly http: HttpClient,
                private readonly apiService: ApiService,
                private readonly userService: UserService,
                private readonly jwtService: JwtService
    ) {
    }

    /* ---------------- MAIN GET METHODS -----------------*/

    /* PACKAGES */
    public getAllPackages(type: SERVICE_TYPE): Observable<Package[]> {
        switch (type) {
            case SERVICE_TYPE.WASH:
                return CarwashService.carwash.pipe(
                    pluck('washPackages'));
                break;
            case SERVICE_TYPE.DETAIL:
                return CarwashService.carwash.pipe(
                    pluck('detailPackages'));
                break;

            // TODO Find out why merge is not working properly
            case SERVICE_TYPE.WASH_AND_DETAIL:
                const washPackages = CarwashService.carwash.pipe(
                    pluck('washPackages'));
                const detailPackages = CarwashService.carwash.pipe(
                    pluck('detailPackages'));
                return Observable.merge(washPackages, detailPackages);
                break;
            default:
                console.log('Invalid Package type');
                console.log('Package type: ' + type + ' not found');
                break;
        }
    }

    // Return static list of packageItems used for display purposes in template
    public getDisplayPackageItems() {
        return CarwashService.displayPackageItems;
    }

    /* STORE */
    public getCarwashMetaData(): Observable<Store> {
        return CarwashService.carwash.pipe(pluck('metaData'));
    }

    /* PROMOTIONS */
    public getPromotionsArray(): Observable<Promotion[]> {
        return CarwashService.carwash.pipe(pluck('promotions'));
    }

    public getStoreId(): string {
        return CarwashService.carwashSubject.getValue().metaData.id;
    }

    /* ---------------- API CALLS -----------------*/

    /* STORE */
    public postNewStore(newStore: Store): Promise<any> {
        // Set HttpHeaders

        let httpHeaders = new HttpHeaders({'Content-Type': CONSTANTS.DEFAULT_CONTENT_TYPE, 'Authorization': this.jwtService.getToken(), 'Accept': '*'});
        const postObject: NewStoreObject = {
            userName: this.userService.getCurrentUserValue().email,
            store: newStore
        };

        // Make post and save new object on success
        return this.apiService.post1(environment.new_store_url, postObject, httpHeaders).pipe(take(1)).toPromise();
    }

    public updateStore(updatedStore: Store): Promise<any> {
        // Set HttpHeaders
        const httpHeaders = new HttpHeaders();
        httpHeaders.set('Content-Type', CONSTANTS.DEFAULT_CONTENT_TYPE);
        httpHeaders.set('Authorization', CONSTANTS.TOKEN_KEY_NAME + ' ' + this.userService.getToken()); // { Authorization: Bearer Token [TOKEN] }

        const postObject: StoreObject = {
            carWashId: this.getStoreId(),
            store: updatedStore,
            storeId: updatedStore.id
        };

        console.log('Post Object: ', postObject);

        return this.apiService.post(environment.update_store_url, new HttpParams(), httpHeaders, postObject).pipe(take(1)).toPromise();
    }

    public cacheStore(storeToCache: Store): void {
        // Create new carwash object with updated metadata info
        const carwashToUpdate = CarwashService.carwashSubject.getValue();
        carwashToUpdate.metaData = storeToCache;
        // Push to carwash cached object
        CarwashService.carwashSubject.next(carwashToUpdate);
    }

    /* PACKAGE */
    public postNewPackage(newPackage: Package): Promise<any> {
        // Set HttpHeaders
        const httpHeaders = new HttpHeaders();
        httpHeaders.set('Content-Type', CONSTANTS.DEFAULT_CONTENT_TYPE);
        httpHeaders.set('Authorization', CONSTANTS.TOKEN_KEY_NAME + ' ' + this.userService.getToken()); // { Authorization: Bearer Token [TOKEN] }

        const postObject: PackageObject = {
            carWashId: this.getStoreId(),
            package: newPackage,
        };

        console.log('Post Object: ', postObject);

        // Make post and return promise for subservice to resolve
        return this.apiService.post(environment.new_package_url, new HttpParams(), httpHeaders, postObject).pipe(take(1)).toPromise();
    }

    public updatePackage(updatedPackage: Package): Promise<any> {
        // Set HttpHeaders
        const httpHeaders = new HttpHeaders();
        httpHeaders.set('Content-Type', CONSTANTS.DEFAULT_CONTENT_TYPE);
        httpHeaders.set('Authorization', CONSTANTS.TOKEN_KEY_NAME + ' ' + this.userService.getToken()); // { Authorization: Bearer Token [TOKEN] }

        const postObject: PackageObject = {
            carWashId: this.getStoreId(),
            package: updatedPackage,
            packageId: updatedPackage.id
        };

        console.log('Post Object: ', postObject);

        // Make post and return promise for subservice to resolve
        return this.apiService.post(environment.update_package_url, new HttpParams(), httpHeaders, postObject).pipe(take(1)).toPromise();
    }

    public updatePackageArray(updatedPackageArray: Package[]): Promise<any> {
        // Set HttpHeaders
        const httpHeaders = new HttpHeaders();
        httpHeaders.set('Content-Type', CONSTANTS.DEFAULT_CONTENT_TYPE);
        httpHeaders.set('Authorization', CONSTANTS.TOKEN_KEY_NAME + ' ' + this.userService.getToken()); // { Authorization: Bearer Token [TOKEN] }

        const postObject: PackageArrayObject = {
            carWashId: this.getStoreId(),
            packageArray: updatedPackageArray,
        };

        console.log('Post Object: ', postObject);

        // Make post and return promise for subservice to resolve
        return this.apiService.post(environment.update_package_array_url, new HttpParams(), httpHeaders, postObject).pipe(take(1)).toPromise();
    }

    public deletePackage(id: string): Promise<any> {
        // Set HttpHeaders
        const httpHeaders = new HttpHeaders();
        httpHeaders.set('Content-Type', CONSTANTS.DEFAULT_CONTENT_TYPE);
        httpHeaders.set('Authorization', CONSTANTS.TOKEN_KEY_NAME + ' ' + this.userService.getToken()); // { Authorization: Bearer Token [TOKEN] }

        const postObject: DeletePackageObject = {
            carWashId: this.getStoreId(),
            packageId: id
        };

        console.log('Post Object: ', postObject);

        // Make post and return promise for subservice to resolve
        return this.apiService.post(environment.delete_package_url, new HttpParams(), httpHeaders, postObject).pipe(take(1)).toPromise();
    }

    public cachePackages(packageArrayToCache: Package[], type: SERVICE_TYPE): void {
        // Create new carwash object with updated package array info
        const carwashToUpdate = CarwashService.carwashSubject.getValue();

        // Check type to ensure it's saved to correct array
        if (type === SERVICE_TYPE.WASH) {
            carwashToUpdate.washPackages = packageArrayToCache;
        } else if (type === SERVICE_TYPE.DETAIL) {
            carwashToUpdate.detailPackages = packageArrayToCache;
        }
        // Update carwash object
        CarwashService.carwashSubject.next(carwashToUpdate);
    }

    /* PROMOTION */
    public postNewPromotion(newPromotion: Promotion): Promise<any> {
        // Set HttpHeaders
        const httpHeaders = new HttpHeaders();
        httpHeaders.set('Content-Type', CONSTANTS.DEFAULT_CONTENT_TYPE);
        httpHeaders.set('Authorization', CONSTANTS.TOKEN_KEY_NAME + ' ' + this.userService.getToken()); // { Authorization: Bearer Token [TOKEN] }

        const postObject: PromotionObject = {
            carWashId: this.getStoreId(),
            promotion: newPromotion
        };

        console.log('Post Object: ', postObject);

        // Make post and return promise for subservice to resolve
        return this.apiService.post(environment.new_promotion_url, new HttpParams(), httpHeaders, postObject).pipe(take(1)).toPromise();
    }

    public updatePromotion(newPromotion: Promotion): Promise<any> {
        // Set HttpHeaders
        const httpHeaders = new HttpHeaders();
        httpHeaders.set('Content-Type', CONSTANTS.DEFAULT_CONTENT_TYPE);
        httpHeaders.set('Authorization', CONSTANTS.TOKEN_KEY_NAME + ' ' + this.userService.getToken()); // { Authorization: Bearer Token [TOKEN] }

        const postObject: PromotionObject = {
            carWashId: this.getStoreId(),
            promotion: newPromotion,
            promotionId: newPromotion.id
        };

        console.log('Post Object: ', postObject);

        // Make post and return promise for subservice to resolve
        return this.apiService.post(environment.update_promotion_url, new HttpParams(), httpHeaders, postObject).pipe(take(1)).toPromise();
    }

    public deletePromotion(id: string): Promise<any> {
        // Set HttpHeaders
        const httpHeaders = new HttpHeaders();
        httpHeaders.set('Content-Type', CONSTANTS.DEFAULT_CONTENT_TYPE);
        httpHeaders.set('Authorization', CONSTANTS.TOKEN_KEY_NAME + ' ' + this.userService.getToken()); // { Authorization: Bearer Token [TOKEN] }

        const postObject: DeletePromotionObject = {
            carWashId: this.getStoreId(),
            promotionId: id
        };

        console.log('Post Object: ', postObject);

        // Make post and return promise for subservice to resolve
        return this.apiService.post(environment.delete_promotion_url, new HttpParams(), httpHeaders, postObject).pipe(take(1)).toPromise();
    }

    public cachePromotions(promotionArrayToCache: Promotion[]): void {
        // Create new carwash object with updated promo array info
        const carwashToUpdate = CarwashService.carwashSubject.getValue();
        carwashToUpdate.promotions = promotionArrayToCache;
        // Push to carwash cached object
        CarwashService.carwashSubject.next(carwashToUpdate);
    }
}
