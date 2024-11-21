import { Router } from '@angular/router';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthGuard {
  constructor(private router: Router) {}

  navigateSecurely() {
    const isLoggedInString = localStorage.getItem('isAuth');
    const isLoggedIn = isLoggedInString ? JSON.parse(isLoggedInString) : false;

    return isLoggedIn || this.router.navigate(['landing-page']);
  }
}
