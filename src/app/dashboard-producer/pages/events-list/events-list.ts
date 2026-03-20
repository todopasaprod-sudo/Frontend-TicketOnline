import { Component, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DASHBOARD_EVENTS, DashboardEvent, EventStatus } from '../../data/dashboard-events';

type FilterStatus = 'todos' | EventStatus;

@Component({
  selector: 'app-events-list',
  imports: [RouterLink],
  templateUrl: './events-list.html',
  styleUrl: './events-list.scss',
})
export class EventsList {
  allEvents = signal<DashboardEvent[]>(DASHBOARD_EVENTS);
  searchQuery = signal('');
  activeFilter = signal<FilterStatus>('todos');
  deleteConfirmId = signal<number | null>(null);

  filters: { label: string; value: FilterStatus }[] = [
    { label: 'Todos', value: 'todos' },
    { label: 'Publicados', value: 'publicado' },
    { label: 'Borradores', value: 'borrador' },
    { label: 'Agotados', value: 'agotado' },
    { label: 'Finalizados', value: 'finalizado' },
  ];

  filteredEvents = computed(() => {
    let events = this.allEvents();
    if (this.activeFilter() !== 'todos') {
      events = events.filter(e => e.status === this.activeFilter());
    }
    const q = this.searchQuery().trim().toLowerCase();
    if (q) {
      events = events.filter(e =>
        e.title.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q) ||
        e.city.toLowerCase().includes(q)
      );
    }
    return events;
  });

  setFilter(f: FilterStatus) { this.activeFilter.set(f); }
  onSearch(e: Event) { this.searchQuery.set((e.target as HTMLInputElement).value); }

  confirmDelete(id: number) { this.deleteConfirmId.set(id); }
  cancelDelete() { this.deleteConfirmId.set(null); }
  deleteEvent(id: number) {
    this.allEvents.update(events => events.filter(e => e.id !== id));
    this.deleteConfirmId.set(null);
  }

  getStatusLabel(status: EventStatus): string {
    const map: Record<EventStatus, string> = {
      publicado: 'Publicado',
      borrador: 'Borrador',
      agotado: 'Agotado',
      finalizado: 'Finalizado',
    };
    return map[status];
  }

  ticketPercent(event: DashboardEvent): number {
    if (event.ticketsTotal === 0) return 0;
    return Math.round((event.ticketsSold / event.ticketsTotal) * 100);
  }

  formatPrice(price: number | null): string {
    if (price === null) return 'Gratis';
    return '$' + price.toLocaleString('es-AR');
  }
}
