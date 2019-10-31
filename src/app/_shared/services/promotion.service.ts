import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {CarwashService} from './carwash.service';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {Discount} from '../models/discount.model';
import {Promotion} from '../models/promotion.model';
import {DisplayPackageItem} from '../models/display-package-item.model';
import {Package} from '../models/package.model';
import {SERVICE_TYPE} from '../enums/SERVICE_TYPE';
import {Frequency} from '../models/frequency.model';

@Injectable({
    providedIn: 'root'
})
export class PromotionService {

    private promotionSubject = new BehaviorSubject<Promotion>(<Promotion>{});
    private promotionArraySubject = new BehaviorSubject<Promotion[]>(<Promotion[]>[]);
    public readonly _promotionArray = this.promotionArraySubject.asObservable();
    public readonly _promotion = this.promotionSubject.asObservable();
    private readonly _displayPackageItems = of(new Array<DisplayPackageItem>());
    public creatingNewPromotion = false;
    public currentPackageArray = new Array<Package>();

    private _currentPromotionIndex = 0;
    private currentPromotionId: string = null;
    public serviceReady = false;

    constructor(
        private readonly fb: FormBuilder,
        private readonly http: HttpClient,
        private readonly carwashService: CarwashService
    ) {
        this._displayPackageItems = carwashService.getDisplayPackageItems();
        this.loadPromotions();
    }

    public loadPromotions(): void {
        this.serviceReady = false;
        console.log('_LOADING PROMOTIONS_');
        this.carwashService.getPromotionsArray().subscribe(
            promotions => {
                if (promotions !== null || undefined) {
                    this.promotionArraySubject.next(promotions);
                    this.promotionSubject.next(promotions[this.currentPromotionIndex]);
                    // this.currentPromotionId = this.promotionSubject.getValue().id;
                    this.serviceReady = true;
                    console.log('_LOADING PROMOTIONS COMPLETE_');
                    console.log('CURRENT PROMOTION: ', this.promotionSubject.getValue());
                } else {
                    console.log('_NO PROMOTIONS FOUND_');
                }
            }
        );
    }

    public loadPackageArray(type: SERVICE_TYPE, skipReset: boolean = false): void {
        const tempSub = this.carwashService.getAllPackages(type).subscribe(
            packageArray => {
                this.currentPackageArray = packageArray;
                console.log('Current Package Array', this.currentPackageArray);

                if (skipReset == false) {
                    // Clear discount packages and update promo subject
                    const tempPromo = this.promotionSubject.getValue();
                    tempPromo.discountPackages = [];
                    this.promotionSubject.next(tempPromo);
                }

            }
        );
        tempSub.unsubscribe();
    }

    public get promotion(): Observable<Promotion> {
        if (!this._promotion) {
            console.log('Promotion is null');
            this.loadPromotions();
        }
        return this._promotion;
    }

    public get promotionArray(): Observable<Promotion[]> {
        if (!this._promotionArray) {
            console.log('Promotion array is null');
            this.loadPromotions();
        }
        return this._promotionArray;
    }

    get displayPackageItems(): Observable<DisplayPackageItem[]> {
        return this._displayPackageItems;
    }

    get currentPromotionIndex() {
        return this._currentPromotionIndex;
    }

    set currentPromotionIndex(index) {
        this._currentPromotionIndex = index;
    }

    public setPromotion(index: number): void {
        if (index !== this.currentPromotionIndex) {
            console.log('_SET PROMOTION_');
            this.currentPromotionIndex = index;
            this.promotionSubject.next(this.promotionArraySubject.getValue()[index]); // TODO Check if the Observable should be loaded instead
        } else {
            return;
        }
    }

    public setPromotionById(id: string): void {
        if (id !== this.currentPromotionId) {
            console.log('_SET PROMOTION BY ID_');
            this.currentPromotionId = id;
            this.promotionArraySubject.getValue().filter(
                (promotion) => {
                    if (promotion.id === this.currentPromotionId) {
                        this.promotionSubject.next(promotion);
                    }
                }
            );
        }
    }

    public toggleActive(id: string) {
        console.log('_SET PROMOTION BY ID_');
        const currentPromotionsArrayValue = this.promotionArraySubject.getValue();
        currentPromotionsArrayValue.filter(
            (promotion) => {
                if (promotion.id === id) {
                    console.log('PROMO EXISTS: ', id);
                    if (promotion.isActive) {
                        promotion.isActive = false;
                    } else if (!promotion.isActive) {
                        promotion.isActive = true;
                    }
                    return;
                } else {
                    console.log('NO PROMO EXISTS: ', id);
                }
            }
        );
        this.promotionArraySubject.next([...currentPromotionsArrayValue]);
    }

    public initNewPromotion() {
        this.creatingNewPromotion = true;
        this.promotionSubject.next(Promotion.EMPTY_MODEL);
        this._currentPromotionIndex = null;
    }

    public cancelNewPromotion(): void {
        this.creatingNewPromotion = false;
        if (this.promotionArraySubject.getValue().length > 0) {
            this.setPromotion(0);
        } else {
            console.log('No promotion to default to. Current index set to null');
            this.currentPromotionIndex = null;
        }
    }

    public createNewPromotion(promoForm: FormGroup): Promise<boolean> {
        const frequency = new Frequency(
            promoForm.get('schedulingFormGroup.frequencyFormGroup.frequencyType').value,
            promoForm.get('schedulingFormGroup.frequencyFormGroup.frequencyValue').value
        );

        const discount = new Discount(
            promoForm.get('discountFormGroup.discountType').value,
            promoForm.get('discountFormGroup.discountAmount').value,
            promoForm.get('discountFormGroup.discountFeatures').value,
        );

        const newPromotion = new Promotion(
            null,
            promoForm.get('nameFormGroup.name').value,
            promoForm.get('descriptionFormGroup.description').value,
            promoForm.get('serviceTypeFormGroup.serviceType').value,
            promoForm.get('schedulingFormGroup.isReoccurring').value,
            frequency,
            promoForm.get('schedulingFormGroup.startDate').value,
            promoForm.get('schedulingFormGroup.endDate').value,
            promoForm.get('discountPackagesFormGroup.discountPackages').value,
            discount,
            promoForm.get('activeTimeFormGroup.startTime').value,
            promoForm.get('activeTimeFormGroup.endTime').value,
            true
        );

        console.log('Creating new promo: ', newPromotion);

        this.promotionSubject.next(newPromotion);

        const currentPromotionArrayValue = this.promotionArraySubject.getValue();
        this.promotionArraySubject.next([...currentPromotionArrayValue, newPromotion]);

        return this.carwashService.postNewPromotion(newPromotion).then((res) => {
                // Set new ID generated from backend and cache new store
                console.log('Promotion Post SUCCESS: ', res);
                this.carwashService.cachePromotion(newPromotion);
                return true;
            }
        ).catch(reason => {
            console.log('Error POSTING package: ', reason);
            return false;
        })
    }

    /* ----------------- FORM METHODS ------------------- */

    public getForm(): FormGroup {
        return this.generatePromotionForm(Promotion.EMPTY_MODEL);
    }

    public generatePromotionForm(promotion: Promotion) {
        return this.fb.group( {
            nameFormGroup: this.generateNameFormGroup(promotion),
            serviceTypeFormGroup: this.generateServiceTypeFormGroup(promotion),
            descriptionFormGroup: this.generateDescriptionFormGroup(promotion),
            schedulingFormGroup: this.generateSchedulingFormGroup(promotion),
            discountFormGroup: this.generateDiscountFormGroup(promotion),
            discountPackagesFormGroup: this.genererateDiscountPackagesFormGroup(promotion),
            activeTimeFormGroup: this.generateActiveTimeFormGroup(promotion)
        });
    }

    private generateServiceTypeFormGroup(promotion: Promotion): FormGroup {
        return this.fb.group({
            serviceType: [promotion.serviceType, Validators.required],
        });
    }

    private generateNameFormGroup(promotion: Promotion): FormGroup {
        return this.fb.group({
            name: [promotion.name, Validators.required],
        });
    }

    private generateDescriptionFormGroup(promotion: Promotion): FormGroup {
        return this.fb.group({
            description: [promotion.description, Validators.required],
        });
    }

    private generateSchedulingFormGroup(promotion: Promotion): FormGroup {
        return this.fb.group({
            isReoccurring: [promotion.isReoccurring, Validators.required],
            frequencyFormGroup: this.generateFrequencyFormGroup(promotion.frequency),
            startDate: [promotion.startDate, Validators.required],
            endDate: [promotion.endDate, Validators.required],
        });
    }

    private generateFrequencyFormGroup(frequency: Frequency) {
        return this.fb.group({
            frequencyType: [frequency.type, Validators.required],
            frequencyValue: [frequency.value, Validators.required]
        })
    }

    private generateDiscountFormGroup(promotion: Promotion): FormGroup {
        return this.fb.group({
                    discountType: [promotion.discount.discountType, Validators.required],
                    discountAmount: [promotion.discount.discountAmount],
                    discountFeatures: [promotion.discount.discountFeatures]
        });
    }

    private genererateDiscountPackagesFormGroup(promotion: Promotion): FormGroup {
        return this.fb.group({
            discountPackages: [promotion.discountPackages, Validators.required],
        });
    }

    private generateActiveTimeFormGroup(promotion: Promotion): FormGroup {
        return this.fb.group({
            startTime: [promotion.startTime, Validators.required],
            endTime: [promotion.endTime, Validators.required],
        });
    }

    /* ------------------ UTILITY METHODS ------------------ */
    private generateId(): string {
        return (Math.random() * 10).toString();
    }

    public convertFormToModel(controls: any): Promotion {
        return new Promotion(
            this.generateId(),
            controls.name,
            controls.description,
            controls.serviceType,
            controls.isReoccurring,
            controls.frequency,
            controls.startDate.toUTCString(),
            controls.endDate.toUTCString(),
            controls.discountPackages,
            new Discount(
                controls.discount.discountType,
                controls.discount.discountAmount,
                controls.discount.discountFeatures
            ),
            controls.startTime,
            controls.endTime,
            false
        );
    }

    calculateDiscount(discount: Discount, _package: Package) {

    }

    formatTime(stringHour: string) {
        let numHour = parseInt(stringHour, 10);
        const suffix = numHour >= 12 ? ' PM' : ' AM';
        numHour = ((numHour + 11) % 12 + 1);
        return numHour.toString() + suffix;
    }
}
