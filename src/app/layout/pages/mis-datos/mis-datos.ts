import { Component, signal, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UpperCasePipe } from '@angular/common';
import { UserService, UpdateUserDto, UserDto } from '../../../core/users/user.service';
import { Navbar } from '../../components/navbar/navbar';
@Component({
  selector: 'app-mis-datos',
  imports: [ReactiveFormsModule, UpperCasePipe, Navbar],
  templateUrl: './mis-datos.html',
  styleUrl: './mis-datos.scss',
})
export class MisDatos implements OnInit {
  private userService = inject(UserService);
  private fb = inject(FormBuilder);

  loading = signal(true);
  saving = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  // Full profile stored for read-only display and for building the PUT payload
  profile = signal<UserDto | null>(null);
  memberSince = signal('');

  form: FormGroup = this.fb.group({
    phoneNumber: ['', [Validators.required, Validators.pattern(/^\+?[\d\s\-]{8,15}$/)]],
    gender: ['', Validators.required],
    province: ['', Validators.required],
  });

  ngOnInit(): void {
    this.userService.getProfile().subscribe({
      next: (user) => {
        this.profile.set(user);
        this.memberSince.set(new Date(user.createdAt).toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' }));
        this.form.patchValue({ phoneNumber: user.phoneNumber, gender: user.gender, province: user.province });
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('No se pudo cargar la información del perfil.');
        this.loading.set(false);
      },
    });
  }

  get formattedDateOfBirth(): string {
    const dob = this.profile()?.dateOfBirth;
    if (!dob) return '';
    const [y, m, d] = dob.split('-');
    return `${d}/${m}/${y}`;
  }

  isInvalid(name: string): boolean {
    const c = this.form.get(name);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const dto: UpdateUserDto = {
      phoneNumber: this.form.value.phoneNumber,
      gender: this.form.value.gender,
      province: this.form.value.province,
    };

    this.saving.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.userService.updateProfile(dto).subscribe({
      next: (updated) => {
        this.profile.set(updated);
        this.saving.set(false);
        this.successMessage.set('Datos actualizados correctamente.');
      },
      error: (err) => {
        this.saving.set(false);
        this.errorMessage.set(err?.error?.error ?? 'Error al guardar los cambios.');
      },
    });
  }
}
