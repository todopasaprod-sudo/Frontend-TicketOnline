import { Component, signal, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EventService, EventDto } from '../../../core/events/event.service';

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

type FilterStatus = 'todos' | 'Published' | 'Draft' | 'Cancelled';

@Component({
  selector: 'app-events-list',
  imports: [RouterLink],
  templateUrl: './events-list.html',
  styleUrl: './events-list.scss',
})
export class EventsList {
  private eventService = inject(EventService);

  loading = signal(true);
  error = signal<string | null>(null);
  allEvents = signal<EventDto[]>([]);
  searchQuery = signal('');
  activeFilter = signal<FilterStatus>('todos');
  cancelConfirmId = signal<string | null>(null);
  cancelling = signal(false);

  filters: { label: string; value: FilterStatus }[] = [
    { label: 'Todos',      value: 'todos'     },
    { label: 'Publicados', value: 'Published' },
    { label: 'Borradores', value: 'Draft'     },
    { label: 'Cancelados', value: 'Cancelled' },
  ];

  filteredEvents = computed(() => {
    let events = this.allEvents();
    if (this.activeFilter() !== 'todos') {
      events = events.filter(e => e.status === this.activeFilter());
    }
    const q = this.searchQuery().trim().toLowerCase();
    if (q) {
      events = events.filter(
        e =>
          e.name.toLowerCase().includes(q) ||
          (e.category ?? '').toLowerCase().includes(q) ||
          e.city.toLowerCase().includes(q),
      );
    }
    return events;
  });

  constructor() {
    this.eventService
      .getMyEvents()
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: evts => {
          this.allEvents.set(evts);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('No se pudieron cargar los eventos.');
          this.loading.set(false);
        },
      });
  }

  setFilter(f: FilterStatus) { this.activeFilter.set(f); }
  onSearch(e: Event) { this.searchQuery.set((e.target as HTMLInputElement).value); }

  confirmCancel(id: string) { this.cancelConfirmId.set(id); }
  abortCancel() { this.cancelConfirmId.set(null); }

  cancelEvent(id: string) {
    this.cancelling.set(true);
    this.eventService.cancel(id).subscribe({
      next: () => {
        this.allEvents.update(evts =>
          evts.map(e => (e.id === id ? { ...e, status: 'Cancelled' } : e)),
        );
        this.cancelConfirmId.set(null);
        this.cancelling.set(false);
      },
      error: () => {
        this.cancelConfirmId.set(null);
        this.cancelling.set(false);
      },
    });
  }

  getGradient(event: EventDto): string {
    if (event.imageUrl?.startsWith('linear-gradient')) return event.imageUrl;
    return CATEGORY_GRADIENTS[event.category ?? ''] ?? DEFAULT_GRADIENT;
  }

  formatDate(isoDate: string): string {
    const [, m, d] = isoDate.split('-');
    return `${parseInt(d)} ${MONTHS[parseInt(m) - 1]}`;
  }

  formatTime(isoTime: string): string {
    const [h, min] = isoTime.split(':');
    return `${h}:${min} hs`;
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      Published: 'Publicado',
      Draft:     'Borrador',
      Cancelled: 'Cancelado',
    };
    return map[status] ?? status;
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      Published: 'publicado',
      Draft:     'borrador',
      Cancelled: 'cancelado',
    };
    return map[status] ?? 'borrador';
  }

  formatPrice(price: number | null | undefined): string {
    if (price == null) return 'Gratis';
    return '$' + price.toLocaleString('es-AR');
  }
}
