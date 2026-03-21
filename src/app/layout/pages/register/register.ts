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
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      identificationType: ['', Validators.required],
      identificationValue: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^\+?[\d\s\-]{8,15}$/)]],
      dateOfBirth: ['', Validators.required],
      gender: ['', Validators.required],
      country: ['', Validators.required],
      province: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(8)]],
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
