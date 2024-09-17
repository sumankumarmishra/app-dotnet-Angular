import { Component, OnInit, EventEmitter, Output, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators, ValidatorFn, ReactiveFormsModule } from '@angular/forms';
import { AccountService } from '../_services/account.service';
import { NgIf } from '@angular/common';
import { TextInputComponent } from "../_forms/text-input/text-input.component";
import { DatePickerComponent } from '../_forms/date-picker/date-picker.component';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  imports: [ReactiveFormsModule, NgIf, TextInputComponent, DatePickerComponent]
})
export class RegisterComponent implements OnInit {
  private accountService = inject(AccountService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  @Output() cancelRegister = new EventEmitter<boolean>();
  registerForm: FormGroup = new FormGroup({});
  maxDate = new Date();
  validationErrors: string[] | undefined;

  ngOnInit(): void {
    this.initializeForm();
    this.maxDate.setFullYear(this.maxDate.getFullYear() - 18);
  }

  initializeForm() {
    this.registerForm = this.fb.group({
      gender: ['male'],
      username: ['', Validators.required],
      knownAs: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      city: ['', Validators.required],
      country: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(8)]],
      confirmPassword: ['', [Validators.required, this.matchValues('password')]],
    });

    this.registerForm.controls['password'].valueChanges.subscribe({
      next: () => this.registerForm.controls['confirmPassword'].updateValueAndValidity()
    });
  }

  matchValues(matchTo: string): ValidatorFn {
    return (control: AbstractControl) => {
      return control.value === control.parent?.get(matchTo)?.value ? null : { isMatching: true };
    };
  }

  register() {
    const dob = this.getDateOnly(this.registerForm.get('dateOfBirth')?.value);
    this.registerForm.patchValue({ dateOfBirth: dob });
  
    this.accountService.register(this.registerForm.value).subscribe({
      next: () => {
        this.router.navigateByUrl('/members');
      },
      error: (error) => {
        if (error?.error) {
          // Check if the error response is an array of error objects
          if (Array.isArray(error.error) && error.error.every((err: any) => err?.description)) {
            // Combine all error descriptions into a single string
            const combinedErrorMessages = error.error.map((err: any) => err.description).join(' \n ');
  
            // Display combined error messages in a single Toastr notification
            this.toastr.error(combinedErrorMessages, 'Registration Error');
          } else if (typeof error.error === 'string') {
            // Show string error
            this.toastr.error(error.error, 'Registration Error');
          } else {
            // Fallback for unexpected error structure
            this.toastr.error('An unexpected error occurred.', 'Registration Error');
          }
        } else {
          // Handle network error
          this.toastr.error('A network error occurred. Please try again.', 'Network Error');
        }
      }
    });
  }
  

  cancel() {
    this.cancelRegister.emit(false);
  }

  private getDateOnly(dob: string | undefined) {
    if (!dob) return;
    return new Date(dob).toISOString().slice(0, 10);
  }
}


// this.validationErrors = (error?.error?.errors || []).map((err: any) => typeof err === 'object' ? JSON.stringify(err) : err.description || 'Unknown error');