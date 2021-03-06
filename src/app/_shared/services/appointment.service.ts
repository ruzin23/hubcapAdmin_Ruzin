import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {VEHICLE_TYPE} from '../enums/VEHICLE_TYPE.model';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Appointment} from '../models/appointment.model';

@Injectable({
    providedIn: 'root'
})
export class AppointmentService {

    public static vehiclesKeys = Object.keys(VEHICLE_TYPE);

    private appointmentsUrl = 'http://localhost:4200/assets/data/appointments.json';

    public static generateId() {
        return '#' + Math.random().toString(); // Will be made more comprehensive in the future
    }

    constructor(private readonly fb: FormBuilder, private readonly http: HttpClient) {}

    fetchAllAppointments(): Observable<Appointment[]> {
        return this.http.get<Appointment[]>(this.appointmentsUrl)
    }

    fetchAppointment(date: string): Observable<Appointment[]> {
        return this.http.get<Appointment[]>(this.appointmentsUrl, )
    }

    newAppointment(appointment: Appointment): Observable<Appointment> {
        return this.http.post<Appointment>(this.appointmentsUrl, appointment);
    }

    public generateAppointmentForm(apiRequest: any): FormGroup {
        return this.fb.group({
            firstName: [apiRequest.firstName, Validators.required],
            lastName: [apiRequest.lastName, Validators.required],
            date: [apiRequest.date, Validators.required],
            vehicleType: [apiRequest.vehicleType, Validators.required],
            packageName: [apiRequest.packageName, Validators.required],
            dropOffTime: [apiRequest.dropOffTime, Validators.required],
            pickUpTime: [apiRequest.pickUpTime, Validators.required],
            phoneNumber: [apiRequest.phoneNumber],
            email: [apiRequest.email]
        });
    }
}
