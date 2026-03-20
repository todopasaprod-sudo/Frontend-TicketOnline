import { Component, signal, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { EventCard, EventData } from '../../../layout/components/event-card/event-card';
import { GRADIENTS } from '../../data/dashboard-events';
import { EventService, CreateEventDto } from '../../../core/events/event.service';

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
      ticketType:    ['paid'],
      price:         [null, [Validators.required, Validators.min(1)]],
      capacity:      [null, [Validators.required, Validators.min(1)]],
      status:        ['borrador'],
    });

    this.form.get('ticketType')!.valueChanges.subscribe(type => {
      const priceCtrl = this.form.get('price')!;
      if (type === 'paid') {
        priceCtrl.setValidators([Validators.required, Validators.min(1)]);
      } else {
        priceCtrl.clearValidators();
        priceCtrl.setValue(null);
      }
      priceCtrl.updateValueAndValidity();
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditing = true;
      this.editingId = id;
      this.eventService.getById(id).subscribe({
        next: (evt) => {
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
            ticketType:    evt.price == null ? 'free' : 'paid',
            price:         evt.price,
            capacity:      evt.capacity,
            status:        evt.status === 'Published' ? 'publicado' : 'borrador',
          });
          if (evt.imageUrl) this.selectedGradient.set(evt.imageUrl);
        },
        error: () => this.errorMessage.set('No se pudo cargar el evento.'),
      });
    }
  }

  get previewEvent(): EventData {
    const v = this.form.value;
    return {
      id:       0,
      title:    v.title    || 'Título del evento',
      category: v.category || 'Categoría',
      date:     this.formatDateForDisplay(v.date || ''),
      time:     v.time ? v.time + ' hs' : '--:-- hs',
      venue:    v.venue || 'Venue del evento',
      city:     v.city  || 'Ciudad',
      price:    v.ticketType === 'free' ? null : (Number(v.price) || 0),
      gradient: this.selectedGradient(),
    };
  }

  isInvalid(name: string): boolean {
    const c = this.form.get(name);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  selectGradient(value: string) {
    this.selectedGradient.set(value);
  }

  formatDateForDisplay(isoDate: string): string {
    if (!isoDate) return 'Fecha TBD';
    const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    const parts = isoDate.split('-');
    if (parts.length < 3) return isoDate;
    return `${parseInt(parts[2], 10)} ${months[parseInt(parts[1], 10) - 1]}`;
  }

  saveDraft() {
    this.form.get('status')!.setValue('borrador');
    this.save();
  }

  onSubmit() {
    this.form.get('status')!.setValue('publicado');
    this.save();
  }

  private buildDto(): CreateEventDto {
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
      price:         v.ticketType === 'paid' ? Number(v.price) : undefined,
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
    const dto = this.buildDto();
    const publish = this.form.get('status')!.value === 'publicado';

    const request$ = this.isEditing && this.editingId
      ? this.eventService.update(this.editingId, dto)
      : this.eventService.create(dto);

    request$.subscribe({
      next: (evt) => {
        if (publish && !this.isEditing) {
          this.eventService.publish(evt.id).subscribe({
            next: () => this.onSaveSuccess(),
            error: () => this.onSaveSuccess(), // creado igual, solo falló el publish
          });
        } else {
          this.onSaveSuccess();
        }
      },
      error: (err) => {
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
