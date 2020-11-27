import {STATES} from '../enums/STATES.model';

export class Address {

    public static EMPTY_MODEL = <Address> {
        city: '',
        state: null,
        street: '',
        zipCode: ''
    };
//
    constructor(private _city: string,
                public state: STATES,
                private _street: string,
                private _zipCode: string) {}

    get street(): string {
        return this._street;
    }

    set street(value: string) {
        this._street = value;
    }

    get zipCode(): string {
        return this._zipCode;
    }

    set zipCode(value: string) {
        this._zipCode = value;
    }

    get city(): string {
        return this._city;
    }

    set city(value: string) {
        this._city = value;
    }
}