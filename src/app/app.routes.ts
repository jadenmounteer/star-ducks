import { Routes } from '@angular/router';
import { LandingPageComponent } from './components/landing-page/landing-page.component';
import { LoginOrSignUpComponent } from './components/login-or-sign-up/login-or-sign-up.component';

export const routes: Routes = [
  {
    path: 'landing-page',
    component: LandingPageComponent,
  },
  {
    path: 'login-or-sign-up',
    component: LoginOrSignUpComponent,
  },
  {
    path: '',
    component: LandingPageComponent,
  },
  {
    path: '**',
    component: LandingPageComponent,
  },
];
