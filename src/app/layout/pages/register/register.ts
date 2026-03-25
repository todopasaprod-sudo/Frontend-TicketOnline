import { Component, signal, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService, RegisterDto } from '../../../core/auth/auth.service';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const confirm = control.get('confirmPassword');
  if (password && confirm && password.value !== confirm.value) {
    confirm.setErrors({ passwordMismatch: true });
    return { passwordMismatch: true };
  }
  return null;
}

function strongPasswordValidator(control: AbstractControl): ValidationErrors | null {
  const value: string = control.value ?? '';
  const errors: ValidationErrors = {};
  if (!/[A-Z]/.test(value)) errors['noUppercase'] = true;
  if (!/[!@#$%^&*()\-_=+\[\]{};:'",.<>/?\\|`~]/.test(value)) errors['noSpecialChar'] = true;
  return Object.keys(errors).length ? errors : null;
}

function strictEmailValidator(control: AbstractControl): ValidationErrors | null {
  const value: string = control.value ?? '';
  const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}(\.[a-zA-Z]{2,})*$/;
  return emailRegex.test(value) ? null : { invalidEmail: true };
}

function minAgeValidator(minAge: number) {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;
    const birthDate = new Date(value);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age < minAge ? { minAge: true } : null;
  };
}

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  private authService = inject(AuthService);
  private router = inject(Router);

  form: FormGroup;
  showPassword = signal(false);
  showConfirmPassword = signal(false);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  docTypeOpen = signal(false);

  readonly docTypeOptions = [
    { value: 'DNI', label: 'DNI' },
    { value: 'PASSPORT', label: 'Pasaporte' },
    { value: 'CUIL', label: 'CUIL' },
    { value: 'CUIT', label: 'CUIT' },
  ];

  get selectedDocTypeLabel(): string {
    const val = this.form.get('identificationType')?.value as string;
    return this.docTypeOptions.find((o) => o.value === val)?.label ?? '';
  }

  selectDocType(value: string) {
    this.form.get('identificationType')?.setValue(value);
    this.form.get('identificationType')?.markAsDirty();
    this.docTypeOpen.set(false);
  }

  genderOpen = signal(false);

  readonly genderOptions = [
    { value: 'Masculino', label: 'Masculino' },
    { value: 'Femenino', label: 'Femenino' },
    { value: 'No binario', label: 'No binario' },
    { value: 'Prefiero no decir', label: 'Prefiero no decir' },
  ];

  get selectedGenderLabel(): string {
    const val = this.form.get('gender')?.value as string;
    return this.genderOptions.find((o) => o.value === val)?.label ?? '';
  }

  selectGender(value: string) {
    this.form.get('gender')?.setValue(value);
    this.form.get('gender')?.markAsDirty();
    this.genderOpen.set(false);
  }

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'\-]{2,}$/)]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'\-]{2,}$/)]],
      email: ['', [Validators.required, strictEmailValidator]],
      identificationType: ['', Validators.required],
      identificationValue: ['', [Validators.required, Validators.pattern(/^\d{6,12}$/)]],
      phone: ['', [Validators.required, Validators.pattern(/^\+?[\d\s\-]{8,15}$/)]],
      dateOfBirth: ['', [Validators.required, minAgeValidator(18)]],
      gender: ['', Validators.required],
      country: ['', [Validators.required, Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'\-]{2,}$/)]],
      province: ['', [Validators.required, Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'\-]{2,}$/)]],
      password: ['', [Validators.required, Validators.minLength(8), strongPasswordValidator]],
      confirmPassword: ['', Validators.required],
      terms: [false, Validators.requiredTrue],
    }, { validators: passwordMatchValidator });
  }

  togglePassword() {
    this.showPassword.update(v => !v);
  }

  toggleConfirmPassword() {
    this.showConfirmPassword.update(v => !v);
  }

  getControl(name: string) {
    return this.form.get(name);
  }

  isInvalid(name: string): boolean {
    const c = this.getControl(name);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.value;
    const dto: RegisterDto = {
      email: v.email,
      name: v.firstName,
      surname: v.lastName,
      password: v.password,
      identificationType: v.identificationType,
      identificationValue: v.identificationValue,
      phoneNumber: v.phone,
      dateOfBirth: v.dateOfBirth,
      gender: v.gender,
      country: v.country,
      province: v.province,
    };

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.authService.register(dto).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err?.error?.message ?? 'Error al crear la cuenta. Intentá de nuevo.');
      },
    });
  }
}
