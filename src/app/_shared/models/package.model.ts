import {PackageItem} from './package.item.model';
import {VEHICLE_TYPE} from '../enums/VEHICLE_TYPE.model';
import {SERVICE_TYPE} from '../enums/SERVICE_TYPE';


export class Package {

    constructor(
    public name: string,
    public type: SERVICE_TYPE,
    public onetimePrices: Map<VEHICLE_TYPE, number>,
    public packageItems: PackageItem[],
    public duration?: number,
    public monthlyPrices?: Map<VEHICLE_TYPE, number>,
    public isUnlimitedMonthly?: boolean,
    public monthlyUses?: number) {
    }
}