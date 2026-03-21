import { Component, signal, computed, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Navbar } from '../../components/navbar/navbar';
import { EventCard } from '../../components/event-card/event-card';
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
const CATEGORIES = ['Todos', 'Música', 'Teatro', 'Deportes', 'Stand Up', 'Arte', 'Gastronomía', 'Infantil'];

@Component({
  selector: 'app-main-page-events',
  imports: [Navbar, EventCard],
  templateUrl: './main-page-events.html',
  styleUrl: './main-page-events.scss',
})
export class MainPageEvents {
  private eventService = inject(EventService);

  categories = CATEGORIES;
  activeCategory = signal('Todos');
  searchQuery = signal('');
  loading = signal(true);
  error = signal<string | null>(null);
  allEvents = signal<EventDto[]>([]);

  filteredEvents = computed(() => {
    let events = this.allEvents();
    if (this.activeCategory() !== 'Todos') {
      events = events.filter(e => e.category === this.activeCategory());
    }
    if (this.searchQuery().trim()) {
      const q = this.searchQuery().toLowerCase();
      events = events.filter(
        e =>
          e.name.toLowerCase().includes(q) ||
          e.city.toLowerCase().includes(q) ||
          e.venue.toLowerCase().includes(q) ||
          (e.category ?? '').toLowerCase().includes(q),
      );
    }
    return events;
  });

  featuredEvent = computed(() => this.allEvents()[0] ?? null);

  heroGradient = computed(() => {
    const e = this.featuredEvent();
    if (!e) return DEFAULT_GRADIENT;
    if (e.imageUrl?.startsWith('linear-gradient')) return e.imageUrl;
    return CATEGORY_GRADIENTS[e.category ?? ''] ?? DEFAULT_GRADIENT;
  });

  heroDate = computed(() => {
    const e = this.featuredEvent();
    if (!e) return '';
    const [, m, d] = e.date.split('-');
    return `${parseInt(d)} ${MONTHS[parseInt(m) - 1]}`;
  });

  heroTime = computed(() => {
    const e = this.featuredEvent();
    if (!e) return '';
    const [h, min] = e.time.split(':');
    return `${h}:${min} hs`;
  });

  constructor() {
    this.eventService
      .getPublished()
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: events => {
          this.allEvents.set(events);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('No se pudieron cargar los eventos.');
          this.loading.set(false);
        },
      });
  }

  setCategory(cat: string) {
    this.activeCategory.set(cat);
    this.searchQuery.set('');
  }

  onSearch(e: Event) {
    this.searchQuery.set((e.target as HTMLInputElement).value);
  }
}
