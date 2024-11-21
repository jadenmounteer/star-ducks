import { Component, inject } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { catchError, Subscription, throwError } from 'rxjs';

@Component({
  selector: 'app-login-or-sign-up',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login-or-sign-up.component.html',
  styleUrl: './login-or-sign-up.component.scss',
})
export class LoginOrSignUpComponent {
  protected readonly authService: AuthService = inject(AuthService);

  protected signUpForm: FormGroup = new FormGroup({
    email: new FormControl('', [
      Validators.required,
      Validators.minLength(4),
      Validators.email,
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
    ]),
    displayName: new FormControl('', [Validators.required]),
  });

  protected loginForm: FormGroup = new FormGroup({
    email: new FormControl('', [
      Validators.required,
      Validators.minLength(4),
      Validators.email,
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
    ]),
  });

  protected error: string = '';

  protected message: string = '';

  private forgotPasswordSub: Subscription | null = null;

  public ngOnDestroy(): void {
    this.forgotPasswordSub?.unsubscribe();
  }

  protected submitLogin() {
    if (this.loginForm.valid) {
      this.login(this.loginForm.value.email, this.loginForm.value.password);
    } else {
      this.error = 'Invalid email or password';
    }
  }

  protected login(email: string, password: string) {
    this.authService
      .login(email, password)
      .pipe(
        catchError((err) => {
          // TODO I can do this better
          alert(err);
          // handle the error
          return throwError(() => new Error('test'));
        })
      )
      .subscribe({
        next: (user) => {
          localStorage.setItem('isAuth', JSON.stringify(true));
        },
      });
  }

  protected signUp(email: string, password: string, displayName: string) {
    const rnd = Math.floor(Math.random() * 1000);

    this.authService
      .signup(email, password, {})
      .pipe(
        catchError((err) => {
          // handle the error
          alert('An error occurred. This email is likely already in use.');
          return throwError(() => new Error(err));
        })
      )
      .subscribe({
        next: (userDetails) => {
          this.authService.createUserData(userDetails.user, displayName);
          localStorage.setItem('isAuth', JSON.stringify(true));
        },
      });
  }

  protected forgotPassword() {
    if (this.loginForm.value.email) {
      this.forgotPasswordSub = this.authService
        .forgotPassword(this.loginForm.value.email)
        .subscribe({
          next: () => {
            // show a message to the user
            this.message = `Password reset email sent to ${this.loginForm.value.email}`;
          },
        });
    } else {
      this.error = 'Please provide an email to send the reset link to.';
    }
  }

  protected updateEmail() {
    // This has already been implemented in auth service
    throw new Error('Not implemented');
  }
}
