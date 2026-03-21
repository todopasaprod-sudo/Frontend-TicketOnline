import { Component, signal, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EventService, EventDto } from '../../../core/events/event.service';
import { AuthService } from '../../../core/auth/auth.service';

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
  selector: 'app-overview',
  imports: [RouterLink],
  templateUrl: './overview.html',
  styleUrl: './overview.scss',
})
export class Overview {
  private eventService = inject(EventService);
  private authService = inject(AuthService);

  userName = computed(() => this.authService.currentUser()?.name ?? 'Productor');

  loading = signal(true);
  error = signal<string | null>(null);
  events = signal<EventDto[]>([]);

  recentEvents = computed(() => this.events().slice(0, 5));

  publishedCount = computed(() => this.events().filter(e => e.status === 'Published').length);
  draftCount = computed(() => this.events().filter(e => e.status === 'Draft').length);
  cancelledCount = computed(() => this.events().filter(e => e.status === 'Cancelled').length);

  constructor() {
    this.eventService
      .getMyEvents()
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: evts => {
          this.events.set(evts);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('No se pudieron cargar los eventos.');
          this.loading.set(false);
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

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      Published: 'Publicado',
      Draft: 'Borrador',
      Cancelled: 'Cancelado',
    };
    return map[status] ?? status;
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      Published: 'publicado',
      Draft: 'borrador',
      Cancelled: 'cancelado',
    };
    return map[status] ?? 'borrador';
  }
}
