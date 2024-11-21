import { Component, inject } from '@angular/core';
import { DropdownComponent } from '../ui-components/dropdown/dropdown.component';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth/auth.service';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-menu',
  standalone: true,
  imports: [DropdownComponent, CommonModule],
  templateUrl: './user-menu.component.html',
  styleUrl: './user-menu.component.scss',
})
export class UserMenuComponent {
  private authService: AuthService = inject(AuthService);
  private router: Router = inject(Router);

  protected logout(): void {
    this.authService
      .logout()
      .pipe(
        catchError((err) => {
          // handle the error
          return throwError(() => new Error('test'));
        })
      )
      .subscribe({
        next: (user) => {
          localStorage.setItem('isAuth', JSON.stringify(false));
          // redirect to the game page for now
          this.router.navigateByUrl('landing-page');
        },
      });
  }
}
