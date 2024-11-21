import { Routes } from '@angular/router';
import { LandingPageComponent } from './components/landing-page/landing-page.component';
import { LoginOrSignUpComponent } from './components/login-or-sign-up/login-or-sign-up.component';
import { HomeComponent } from './components/home/home.component';
import { inject } from '@angular/core';
import { AuthGuard } from './auth/auth.guard';

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
    path: 'home',
    component: HomeComponent,
    canActivate: [() => inject(AuthGuard).navigateSecurely()],
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
