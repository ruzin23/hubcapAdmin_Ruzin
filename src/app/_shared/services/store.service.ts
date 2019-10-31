import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {DAY} from '../enums/DAY.model';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {CarwashService} from './carwash.service';
import {StoreHours} from '../models/store-hours.model';
import {HoursException} from '../models/hours-exception.model';
import {Store} from '../models/store.model';
import {BehaviorSubject, Observable} from 'rxjs';
import {Rating} from '../models/rating.model';
import {Address} from '../models/address.model';
import {pluck} from 'rxjs/operators';
import {ApiService} from '../../_core/services/api.service';
import {environment} from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class StoreService {
    public serviceReady: boolean;
    private storeSubject = new BehaviorSubject<Store>(<Store>{});
    private readonly _store = this.storeSubject.asObservable();

    constructor(
        private readonly fb: FormBuilder,
        private readonly http: HttpClient,
        private readonly carwashService: CarwashService,
        private readonly apiService: ApiService
    ) {
        this.loadStore();
    }

    public loadStore() {
        this.serviceReady = false;
        console.log('_LOADING STORE_');
        this.carwashService.getCarwashMetaData().subscribe(
            store => {
                this.storeSubject.next(store);
                this.serviceReady = true;
                console.log('_LOADING STORE COMPLETE_');
                console.log('CURRENT STORE: ', this.storeSubject.getValue());
            }
        )
    }

    get store(): Observable<Store> {
        return this._store;
    }

    public getHoursExceptions(): Observable<HoursException[]> {
        return this.storeSubject.pipe(pluck('hoursOfOperation', 'hoursExceptions'));
    }

    public getForm(): FormGroup {
        return this.generateStoreForm(Store.EMPTY_MODEL);
    }


    /* HOUR EXCEPTION HANDLERS */
    public createException(exceptionForm: FormGroup) {
        const newException = new HoursException(
            exceptionForm.get('name').value,
            exceptionForm.get('date').value,
            exceptionForm.get('exceptionType').value,
            exceptionForm.get('openTime').value,
            exceptionForm.get('closeTime').value,
        );

        const storeToUpdate = this.storeSubject.getValue();
        const exceptionsToUpdate = storeToUpdate.hoursOfOperation.hoursExceptions;
        const updatedExceptions = [...exceptionsToUpdate, newException];
        storeToUpdate.hoursOfOperation.hoursExceptions = updatedExceptions;
        this.storeSubject.next(storeToUpdate);
    }

    public updateException(updatedException: HoursException, index: number) {
        const storeToUpdate = this.storeSubject.getValue();
        storeToUpdate.hoursOfOperation.hoursExceptions[index] = updatedException;
        this.storeSubject.next(storeToUpdate);
    }

    public deleteException(index: number) {
        const storeToUpdate = this.storeSubject.getValue();
        storeToUpdate.hoursOfOperation.hoursExceptions.splice(index, 1);
        this.storeSubject.next(storeToUpdate);
    }

    /* STORE HANDLERS */
    public createStore(storeForm: FormGroup) {
        const addressCoordinates = new Map<string, string>();
        let newStore: Store;

        // Create address string for Geocode API call
        const fullAddressQuery = (
            storeForm.get('streetAddress').value +
            storeForm.get('city').value +
            storeForm.get('state').value
        );

        // Set params for Geocode API call
        let httpParams = new HttpParams();
        httpParams = httpParams.set('address', fullAddressQuery);
        httpParams = httpParams.set('key', environment.GOOGLE_API_KEY);

        // Geocode API call
        this.apiService.get(environment.geolocation_base_url, httpParams).subscribe(
            response => {
                // Convert lat & lng to CarwashCoordinates
                addressCoordinates.set('lat', response.data.results[0].geometry.location.lat);
                addressCoordinates.set('lng', response.data.results[0].geometry.location.lng);
                // Create new store object to be pushed to backend
                newStore = this.instantiateStore(storeForm, addressCoordinates);
                // this.carwashService.createNewStore(newStore);
                console.log('LAT AND LONG VALUES: ', addressCoordinates);
                // this.carwashService.createNewStore(newStore);
            }
        );

    }

    public updateStore(updatedStore: Store) {
        console.log('Updated Store: ', updatedStore);
        const addressCoordinates = new Map<string, string>();

        // Create address string for Geocode API call
        const fullAddressQuery = (
            updatedStore.address.street + ',' +
            updatedStore.address.city + ',' +
            updatedStore.address.state
        );

        // Set params for Geocode API call
        let httpParams = new HttpParams();
        httpParams = httpParams.set('address', fullAddressQuery);
        httpParams = httpParams.set('key', environment.GOOGLE_API_KEY);

        let httpHeaders = new HttpHeaders();
        httpHeaders = httpHeaders.set('Access-Control-Allow-Headers', 'Content-Type, POST, GET, PUT, DELETE, OPTIONS, HEAD, Authorization');
        httpHeaders = httpHeaders.set('Access-Control-Allow-Origin', '*');
        httpHeaders = httpHeaders.set('Content-Type', 'application/json');

        // Make Geocode API call if location has changed
        if (updatedStore.coordinates !== this.storeSubject.getValue().coordinates) {
            console.log('Addresses change detected. Recalculating coordinates...');
            this.apiService.get(environment.geolocation_base_url, httpParams, httpHeaders).subscribe(
                response => {
                    // Convert lat & lng to CarwashCoordinates
                    addressCoordinates.set('lat', response.data.results[0].geometry.location.lat);
                    addressCoordinates.set('lng', response.data.results[0].geometry.location.lng);
                    // Create new store object to be pushed to backend
                    console.log('LAT AND LONG VALUES: ', addressCoordinates);
                    this.carwashService.updateStore(updatedStore);
                },
                error => {
                    console.log('Update Store Error: ', error)
                }
            );
        }

    }

    deleteStore(id: string) {

    }

    public instantiateStore(storeForm: FormGroup, coordinates: Map<string, string>): Store {
        const newAddress = new Address(
            storeForm.get('city').value,
            storeForm.get('state').value,
            storeForm.get('streetAddress').value,
            storeForm.get('zipcode').value,
        );

        return new Store(
            null,
            storeForm.get('name').value,
            storeForm.get('type').value,
            newAddress,
            storeForm.get('phoneNumber').value,
            coordinates,
            storeForm.get('hoursOfOperation').value,
            storeForm.get('email').value,
            storeForm.get('website').value,
        );
    }

    /* --------------------- UTIL METHODS ------------------------- */

    public generateStoreForm(store: Store): FormGroup {
        return this.fb.group({
            id: [store.id],
            name: [store.name, Validators.required],
            streetAddress: [store.address.street, Validators.required],
            city: [store.address.city, Validators.required],
            state: [store.address.state, Validators.required],
            zipcode: [store.address.zipcode, Validators.required],
            email: [store.email, [Validators.required, Validators.email]],
            phoneNumber: [store.phoneNumber, Validators.required],
            storeHours: this.fb.array(this.addStoreHours().map
            (storeHours => this.generateHoursForm(storeHours))),
            website: [store.website]
        });
    }

    private generateHoursForm(storeHours: StoreHours): FormGroup {
        return this.fb.group({
            day: [storeHours.day, Validators.required],
            isOpen: [storeHours.isOpen(), Validators.required],
            openTime: [storeHours.openTime, Validators.required],
            closeTime: [storeHours.closeTime, Validators.required]
        });
    }

    public generateExceptionsForm(exception: HoursException): FormGroup {
        return this.fb.group({
            name: [exception.name, Validators.required],
            date: [exception.date, Validators.required],
            exceptionType: [exception.exceptionType, Validators.required],
            openTime: [exception.openTime],
            closeTime: [exception.closeTime]
        });
    }

    private addStoreHours() {
        const hours = [];
        Object.keys(DAY).forEach(function (day) {
            const dayEnum: DAY = DAY[day];
            hours.push(new StoreHours(dayEnum));
        });
        return hours;
    }
}

