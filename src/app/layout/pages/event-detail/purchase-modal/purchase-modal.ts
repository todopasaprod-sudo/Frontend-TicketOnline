import { Component, computed, inject, input, output, signal, HostListener } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EventDetailDto, TicketTypeDto } from '../../../../core/events/event.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { UserService } from '../../../../core/users/user.service';

export interface CartItem {
  ticketType: TicketTypeDto;
  quantity: number;
}

const IDENTIFICATION_TYPES = ['DNI', 'CUIT', 'Pasaporte', 'CE'];
const COUNTRIES = ['Argentina', 'Uruguay', 'Chile', 'Brasil', 'Paraguay', 'Bolivia', 'Perú', 'Colombia', 'México', 'España', 'Otro'];

function emailMatchValidator(group: AbstractControl) {
  const email = group.get('email')?.value;
  const confirm = group.get('emailConfirm')?.value;
  return email === confirm ? null : { emailMismatch: true };
}

@Component({
  selector: 'app-purchase-modal',
  imports: [ReactiveFormsModule],
  templateUrl: './purchase-modal.html',
  styleUrl: './purchase-modal.scss',
})
export class PurchaseModal {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private userService = inject(UserService);

  event = input.required<EventDetailDto>();
  cartItems = input.required<CartItem[]>();
  close = output<void>();

  currentStep = signal(1);
  discountInput = signal('');
  discountError = signal<string | null>(null);
  selectedPayment = signal<string | null>(null);
  loadingProfile = signal(true);

  readonly identificationTypes = IDENTIFICATION_TYPES;
  readonly countries = COUNTRIES;

  subtotal = computed(() =>
    this.cartItems().reduce((sum, item) => sum + item.ticketType.price * item.quantity, 0)
  );
  serviceFee = computed(() => Math.round(this.subtotal() * 0.15));
  total = computed(() => this.subtotal() + this.serviceFee());
  totalItems = computed(() => this.cartItems().reduce((sum, item) => sum + item.quantity, 0));

  buyerForm: FormGroup;

  constructor() {
    const user = this.authService.currentUser();

    this.buyerForm = this.fb.group({
      name:                 [user?.name ?? '', Validators.required],
      surname:              [user?.surname ?? '', Validators.required],
      identificationType:   ['DNI', Validators.required],
      identificationValue:  ['', Validators.required],
      email:                [user?.email ?? '', [Validators.required, Validators.email]],
      emailConfirm:         [user?.email ?? '', [Validators.required, Validators.email]],
      phoneNumber:          ['', Validators.required],
      country:              ['Argentina', Validators.required],
      province:             ['', Validators.required],
    }, { validators: emailMatchValidator });

    if (user) {
      this.userService.getProfile().pipe(takeUntilDestroyed()).subscribe({
        next: profile => {
          this.buyerForm.patchValue({
            identificationType:  profile.identificationType,
            identificationValue: profile.identificationValue,
            phoneNumber:         profile.phoneNumber,
            country:             profile.country,
            province:            profile.province,
          });
          this.loadingProfile.set(false);
        },
        error: () => this.loadingProfile.set(false),
      });
    } else {
      this.loadingProfile.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  onEscape() { this.onClose(); }

  onClose() { this.close.emit(); }

  onOverlayClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('purchase-overlay')) {
      this.onClose();
    }
  }

  nextStep() {
    if (this.currentStep() === 2) {
      this.buyerForm.markAllAsTouched();
      if (this.buyerForm.invalid) return;
    }
    if (this.currentStep() < 3) this.currentStep.update(s => s + 1);
  }

  prevStep() {
    if (this.currentStep() > 1) this.currentStep.update(s => s - 1);
  }

  applyDiscount() {
    this.discountError.set('Código no válido o expirado.');
  }

  selectPayment(method: string) {
    this.selectedPayment.set(method);
  }

  isInvalid(field: string): boolean {
    const c = this.buyerForm.get(field);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  get emailMismatch(): boolean {
    return !!(this.buyerForm.hasError('emailMismatch') &&
      this.buyerForm.get('emailConfirm')?.touched);
  }

  formatPrice(value: number): string {
    return '$ ' + value.toLocaleString('es-AR', { minimumFractionDigits: 2 });
  }
}
