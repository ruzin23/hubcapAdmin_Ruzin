import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { NoAuthGuard } from './no-auth-guard.service';
import {RegisterComponent} from './register/register.component';

const routes: Routes = [
    {
        path: 'login',
        component: LoginComponent,
        canActivate: [NoAuthGuard]
    },
    {
        path: 'register',
        component: RegisterComponent,
        canActivate: [NoAuthGuard]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AuthRoutingModule {}
