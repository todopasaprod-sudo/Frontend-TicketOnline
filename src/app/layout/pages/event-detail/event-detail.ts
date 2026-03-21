import { Component, signal, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Navbar } from '../../components/navbar/navbar';
import { EventService, EventDetailDto, TicketTypeDto } from '../../../core/events/event.service';

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
const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

@Component({
  selector: 'app-event-detail',
  imports: [Navbar, RouterLink],
  templateUrl: './event-detail.html',
  styleUrl: './event-detail.scss',
})
export class EventDetail {
  private route = inject(ActivatedRoute);
  private eventService = inject(EventService);

  loading = signal(true);
  error = signal<string | null>(null);
  event = signal<EventDetailDto | null>(null);

  gradient = computed(() => {
    const e = this.event();
    if (!e) return DEFAULT_GRADIENT;
    if (e.imageUrl?.startsWith('linear-gradient')) return e.imageUrl;
    return CATEGORY_GRADIENTS[e.category ?? ''] ?? DEFAULT_GRADIENT;
  });

  formattedDate = computed(() => {
    const e = this.event();
    if (!e) return '';
    const [y, m, d] = e.date.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return `${DAYS[date.getDay()]} ${d} de ${['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'][m - 1]} ${y}`;
  });

  formattedTime = computed(() => {
    const e = this.event();
    if (!e) return '';
    const [h, min] = e.date ? e.time.split(':') : [];
    return `${h}:${min} hs`;
  });

  constructor() {
    const slug = this.route.snapshot.paramMap.get('slug')!;
    this.eventService
      .getBySlug(slug)
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: evt => {
          this.event.set(evt);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('No se encontró el evento.');
          this.loading.set(false);
        },
      });
  }

  formatPrice(price: number): string {
    if (price === 0) return 'Gratis';
    return '$' + price.toLocaleString('es-AR');
  }

  availableStock(tt: TicketTypeDto): string {
    if (tt.stock == null) return 'Ilimitado';
    const avail = tt.stock - tt.soldCount;
    return avail <= 0 ? 'Agotado' : avail.toString();
  }

  isSoldOut(tt: TicketTypeDto): boolean {
    return tt.stock != null && tt.stock - tt.soldCount <= 0;
  }
}
