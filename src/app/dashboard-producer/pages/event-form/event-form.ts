import { Component, signal, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EventCard } from '../../../layout/components/event-card/event-card';
import { GRADIENTS } from '../../data/dashboard-events';
import { EventService, CreateEventDto, UpdateEventDto, EventDto, TicketTypeDto } from '../../../core/events/event.service';

@Component({
  selector: 'app-event-form',
  imports: [ReactiveFormsModule, RouterLink, EventCard],
  templateUrl: './event-form.html',
  styleUrl: './event-form.scss',
})
export class EventForm {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private eventService = inject(EventService);

  gradients = GRADIENTS;
  selectedGradient = signal(GRADIENTS[0].value);
  isEditing = false;
  editingId: string | null = null;
  isLoading = signal(false);
  saveSuccess = signal(false);
  errorMessage = signal<string | null>(null);

  // Para edición: ticket types cargados desde la API (read-only en esta versión)
  existingTicketTypes = signal<TicketTypeDto[]>([]);

  categories = ['Música', 'Teatro', 'Deportes', 'Stand Up', 'Arte', 'Gastronomía', 'Infantil', 'Cine'];
  cities = [
    'Buenos Aires', 'Córdoba', 'Mendoza', 'Rosario', 'Salta',
    'Tucumán', 'Mar del Plata', 'Bariloche', 'Cosquín', 'San Isidro',
  ];

  form: FormGroup;

  constructor() {
    this.form = this.fb.group({
      title:         ['', [Validators.required, Validators.minLength(5)]],
      description:   [''],
      category:      ['', Validators.required],
      date:          ['', Validators.required],
      time:          ['', Validators.required],
      venue:         ['', Validators.required],
      city:          ['', Validators.required],
      address:       ['', Validators.required],
      organizerName: ['', Validators.required],
      capacity:      [null],
      status:        ['borrador'],
      ticketTypes:   this.fb.array([this.newTicketTypeGroup()]),
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditing = true;
      this.editingId = id;

      this.eventService.getById(id).subscribe({
        next: evt => {
          this.form.patchValue({
            title:         evt.name,
            description:   evt.description ?? '',
            category:      evt.category ?? '',
            date:          evt.date,
            time:          evt.time.substring(0, 5),
            venue:         evt.venue,
            city:          evt.city,
            address:       evt.address,
            organizerName: evt.organizerName,
            capacity:      evt.capacity,
            status:        evt.status === 'Published' ? 'publicado' : 'borrador',
          });
          if (evt.imageUrl) this.selectedGradient.set(evt.imageUrl);
        },
        error: () => this.errorMessage.set('No se pudo cargar el evento.'),
      });

      this.eventService.getTicketTypes(id).pipe(takeUntilDestroyed()).subscribe({
        next: types => this.existingTicketTypes.set(types),
      });
    }
  }

  // ── Ticket types FormArray ─────────────────────────────────────────────────

  get ticketTypesArray(): FormArray {
    return this.form.get('ticketTypes') as FormArray;
  }

  newTicketTypeGroup(): FormGroup {
    return this.fb.group({
      name:         ['', Validators.required],
      description:  [''],
      price:        [0, [Validators.required, Validators.min(0)]],
      stock:        [null],
      maxPerOrder:  [5, [Validators.required, Validators.min(1)]],
      packageSize:  [1],
      sectionLabel: [''],
      badge:        [''],
    });
  }

  addTicketType() {
    this.ticketTypesArray.push(this.newTicketTypeGroup());
  }

  removeTicketType(i: number) {
    if (this.ticketTypesArray.length > 1) {
      this.ticketTypesArray.removeAt(i);
    }
  }

  isInvalidTicket(i: number, field: string): boolean {
    const c = this.ticketTypesArray.at(i).get(field);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  // ── Form helpers ───────────────────────────────────────────────────────────

  get previewEvent(): EventDto {
    const v = this.form.value;
    const firstTicket = v.ticketTypes?.[0];
    const price = firstTicket?.price > 0 ? Number(firstTicket.price) : undefined;
    return {
      id:              '',
      name:            v.title    || 'Título del evento',
      category:        v.category || 'Categoría',
      date:            v.date     || '2026-01-01',
      time:            v.time ? v.time + ':00' : '00:00:00',
      venue:           v.venue || 'Venue del evento',
      address:         v.address || '',
      city:            v.city  || 'Ciudad',
      organizerName:   v.organizerName || '',
      imageUrl:        this.selectedGradient(),
      price,
      createdByUserId: '',
      status:          'Draft',
      createdAt:       new Date().toISOString(),
    };
  }

  isInvalid(name: string): boolean {
    const c = this.form.get(name);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  selectGradient(value: string) {
    this.selectedGradient.set(value);
  }

  formatPrice(price: number): string {
    return '$' + price.toLocaleString('es-AR');
  }

  // ── Save ───────────────────────────────────────────────────────────────────

  saveDraft() {
    this.form.get('status')!.setValue('borrador');
    this.save();
  }

  onSubmit() {
    this.form.get('status')!.setValue('publicado');
    this.save();
  }

  private buildCreateDto(): CreateEventDto {
    const v = this.form.value;
    return {
      name:          v.title.trim(),
      description:   v.description?.trim() || undefined,
      date:          v.date,
      time:          v.time + ':00',
      venue:         v.venue.trim(),
      address:       v.address.trim(),
      city:          v.city,
      organizerName: v.organizerName.trim(),
      imageUrl:      this.selectedGradient(),
      category:      v.category || undefined,
      capacity:      v.capacity ? Number(v.capacity) : undefined,
      ticketTypes:   v.ticketTypes.map((t: any) => ({
        name:         t.name.trim(),
        description:  t.description?.trim() || undefined,
        price:        Number(t.price),
        stock:        t.stock ? Number(t.stock) : undefined,
        maxPerOrder:  Number(t.maxPerOrder) || 5,
        packageSize:  Number(t.packageSize) || 1,
        sectionLabel: t.sectionLabel?.trim() || undefined,
        badge:        t.badge?.trim() || undefined,
        isActive:     true,
        sortOrder:    0,
      })),
    };
  }

  private buildUpdateDto(): UpdateEventDto {
    const v = this.form.value;
    return {
      name:          v.title.trim(),
      description:   v.description?.trim() || undefined,
      date:          v.date,
      time:          v.time + ':00',
      venue:         v.venue.trim(),
      address:       v.address.trim(),
      city:          v.city,
      organizerName: v.organizerName.trim(),
      imageUrl:      this.selectedGradient(),
      category:      v.category || undefined,
      capacity:      v.capacity ? Number(v.capacity) : undefined,
    };
  }

  private save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    const publish = this.form.get('status')!.value === 'publicado';

    const request$ = this.isEditing && this.editingId
      ? this.eventService.update(this.editingId, this.buildUpdateDto())
      : this.eventService.create(this.buildCreateDto());

    request$.subscribe({
      next: evt => {
        if (publish && !this.isEditing) {
          this.eventService.publish(evt.id).subscribe({
            next: () => this.onSaveSuccess(),
            error: () => this.onSaveSuccess(),
          });
        } else {
          this.onSaveSuccess();
        }
      },
      error: err => {
        this.isLoading.set(false);
        this.errorMessage.set(err?.error?.message ?? 'Error al guardar el evento.');
      },
    });
  }

  private onSaveSuccess() {
    this.isLoading.set(false);
    this.saveSuccess.set(true);
    setTimeout(() => {
      this.saveSuccess.set(false);
      this.router.navigate(['../'], { relativeTo: this.route });
    }, 2000);
  }
}
