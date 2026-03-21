import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EventDto } from '../../../core/events/event.service';

const CATEGORY_GRADIENTS: Record<string, string> = {
  'Música': 'linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)',
  'Teatro': 'linear-gradient(135deg, #7c2d12 0%, #dc2626 100%)',
  'Deportes': 'linear-gradient(135deg, #065f46 0%, #059669 100%)',
  'Stand Up': 'linear-gradient(135deg, #b45309 0%, #d97706 100%)',
  'Arte': 'linear-gradient(135deg, #1e40af 0%, #7c3aed 100%)',
  'Gastronomía': 'linear-gradient(135deg, #831843 0%, #db2777 100%)',
  'Infantil': 'linear-gradient(135deg, #5b21b6 0%, #a855f7 100%)',
};

const DEFAULT_GRADIENT = 'linear-gradient(135deg, #0f4c75 0%, #1b6ca8 100%)';
const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

@Component({
  selector: 'app-event-card',
  imports: [RouterLink],
  templateUrl: './event-card.html',
  styleUrl: './event-card.scss',
})
export class EventCard {
  event = input.required<EventDto>();

  gradient = computed(() => {
    const e = this.event();
    if (e.imageUrl?.startsWith('linear-gradient')) return e.imageUrl;
    return CATEGORY_GRADIENTS[e.category ?? ''] ?? DEFAULT_GRADIENT;
  });

  formattedDate = computed(() => {
    const [, m, d] = this.event().date.split('-');
    return `${parseInt(d)} ${MONTHS[parseInt(m) - 1]}`;
  });

  formattedTime = computed(() => {
    const [h, min] = this.event().time.split(':');
    return `${h}:${min} hs`;
  });

  isSoldOut = computed(() => this.event().status === 'Cancelled');

  isNew = computed(() => {
    const diff = Date.now() - new Date(this.event().createdAt).getTime();
    return diff < 7 * 24 * 60 * 60 * 1000;
  });

  formatPrice(price: number): string {
    return price.toLocaleString('es-AR');
  }
}
