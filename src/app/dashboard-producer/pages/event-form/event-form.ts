import { Component, signal, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { EventCard, EventData } from '../../../layout/components/event-card/event-card';
import { DASHBOARD_EVENTS, GRADIENTS } from '../../data/dashboard-events';

@Component({
  selector: 'app-event-form',
  imports: [ReactiveFormsModule, RouterLink, EventCard],
  templateUrl: './event-form.html',
  styleUrl: './event-form.scss',
})
export class EventForm {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);

  gradients = GRADIENTS;
  selectedGradient = signal(GRADIENTS[0].value);
  isEditing = false;
  editingId: number | null = null;
  isLoading = signal(false);
  saveSuccess = signal(false);

  categories = ['Música', 'Teatro', 'Deportes', 'Stand Up', 'Arte', 'Gastronomía', 'Infantil', 'Cine'];
  cities = [
    'Buenos Aires', 'Córdoba', 'Mendoza', 'Rosario', 'Salta',
    'Tucumán', 'Mar del Plata', 'Bariloche', 'Cosquín', 'San Isidro',
  ];

  form: FormGroup;

  constructor() {
    this.form = this.fb.group({
      title:       ['', [Validators.required, Validators.minLength(5)]],
      description: [''],
      category:    ['', Validators.required],
      date:        ['', Validators.required],
      time:        ['', Validators.required],
      venue:       ['', Validators.required],
      city:        ['', Validators.required],
      address:     [''],
      ticketType:  ['paid'],
      price:       [null, [Validators.required, Validators.min(1)]],
      capacity:    [null, [Validators.required, Validators.min(1)]],
      status:      ['borrador'],
    });

    // Validación condicional del precio
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

    // Modo edición
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditing = true;
      this.editingId = +id;
      const event = DASHBOARD_EVENTS.find(e => e.id === +id);
      if (event) {
        this.form.patchValue({
          title:      event.title,
          category:   event.category,
          date:       event.formDate,
          time:       event.time.replace(' hs', ''),
          venue:      event.venue,
          city:       event.city,
          ticketType: event.price === null ? 'free' : 'paid',
          price:      event.price,
          capacity:   event.ticketsTotal,
          status:     event.status === 'borrador' ? 'borrador' : 'publicado',
        });
        this.selectedGradient.set(event.gradient);
      }
    }
  }

  get previewEvent(): EventData {
    const v = this.form.value;
    return {
      id:       this.editingId ?? 0,
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

  private save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.isLoading.set(true);
    setTimeout(() => {
      this.isLoading.set(false);
      this.saveSuccess.set(true);
      setTimeout(() => this.saveSuccess.set(false), 3500);
    }, 1400);
  }
}
