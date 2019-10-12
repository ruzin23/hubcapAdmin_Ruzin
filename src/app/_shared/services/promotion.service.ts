import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {CarwashService} from './carwash.service';
import {CONSTANTS} from '../CONSTANTS';
import {BehaviorSubject} from 'rxjs';
import {Discount} from '../models/discount.model';
import {Promotion} from '../models/promotion.model';

@Injectable({
    providedIn: 'root'
})
export class PromotionService {

    // public promotion: Promotion;
    public promotionSubject: BehaviorSubject<Promotion>;
    public promotionForm: FormGroup;
    public promotions: Promotion[];

    constructor(
        private readonly fb: FormBuilder,
        private readonly http: HttpClient,
        private readonly carwashService: CarwashService
    ) {}

    public stagePromotion(id: string) {
        for (const promotion of this.promotions) {
            if (promotion.id === id) {
                this.promotionSubject = new BehaviorSubject(promotion);
            } else {
                console.log('Promo with id: ', id + ' not found!');
                console.log('Possible incorrect Promo Id');
            }
        }
    }

    public stageTemplatePromotion(): void {
        this.promotionSubject = new BehaviorSubject(CONSTANTS.PROMOTION_TEMPLATE);
        // this.initLivePromotion();
        console.log('SELECTED PROMOTION: ', this.promotionSubject.getValue());
    }

    // Returns the raw Promotion value
    public getPromotion(): Promotion {
        if (!this.promotionSubject) {
            console.log('No promotion staged!');
            console.log('Setting template');
            this.stageTemplatePromotion();
        }
        return this.promotionSubject.getValue();
    }

    public initLivePromotion() {
        this.promotionSubject = new BehaviorSubject(<Promotion>{});
        this.promotionSubject.asObservable();
    }

    public getForm(): FormGroup {
        return this.generatePromotionForm(Promotion.EMPTY_MODEL);
    }

    public getFormControls(): any {
        if (!this.promotionForm) {
            console.log('Cannot retrieve controls without first initializing form');
            console.log('Initializing...');
            this.getForm();
        }
        return this.promotionForm;
    }


/*    getAllPromotions(): Promotion[] {
        this.carwashService.getPromotions().subscribe(
            promotions => this.promotions = promotions
        );
        return this.promotions;
    }*/

/*    updatePromotions(_promotions: Promotion[]): Observable<Promotion[]> {
        return this.http.put<Promotion[]>(this.promotionsUrl, _promotions);
    }

    updatePromotion(_promotion: Promotion): Observable<Promotion> {
        return this.http.put<Promotion>(this.promotionsUrl, _promotion);
    }

    newPromotion(_promotion: Promotion): Observable<Promotion> {
        return this.http.post<Promotion>(this.promotionsUrl, _promotion);
    }*/

    /* ----------------- FORM METHODS ------------------- */

    public generatePromotionForm(promotion: Promotion) {
        return this.fb.group( {
            packageTypeFormGroup: this.generatePackageTypeFormGroup(promotion),
            nameFormGroup: this.generateNameFormGroup(promotion),
            descriptionFormGroup: this.generateDescriptionFormGroup(promotion),
            frequencyFormGroup: this.generateFrequencyFormGroup(promotion),
            discountFormGroup: this.generateDiscountFormGroup(promotion),
            discountPackagesFormGroup: this.genererateDiscountPackagesFormGroup(promotion),
            activeTimeFormGroup: this.generateActiveTimeFormGroup(promotion)
        });
    }

    private generatePackageTypeFormGroup(promotion: Promotion): FormGroup {
        return this.fb.group({
            packageType: [promotion.serviceType, Validators.required],
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

    private generateFrequencyFormGroup(promotion: Promotion): FormGroup {
        return this.fb.group({
            frequencyType: [promotion.frequencyType, Validators.required],
            frequency: [promotion.frequency, Validators.required],
            startDate: [promotion.startDate, Validators.required],
            endDate: [promotion.endDate, Validators.required],
        });
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
            controls.type,
            controls.name,
            controls.description,
            controls.frequencyType,
            controls.frequency,
            controls.startDate,
            controls.endDate,
            controls.serviceType,
            new Discount(
                controls.discount.discountType,
                controls.discount.discountAmount,
                controls.discount.discountFeatures
            ),
            controls.startTime,
            controls.endTime
        );
    }
}
