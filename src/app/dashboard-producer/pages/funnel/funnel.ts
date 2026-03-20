import { Component, signal, computed } from '@angular/core';
import { DASHBOARD_EVENTS } from '../../data/dashboard-events';
import { FUNNEL_DATA } from '../../data/analytics-data';

interface FunnelStep {
  label: string;
  key: 'views' | 'clicks' | 'checkouts' | 'purchases';
  color: string;
  icon: string;
}

@Component({
  selector: 'app-funnel',
  imports: [],
  templateUrl: './funnel.html',
  styleUrl: './funnel.scss',
})
export class Funnel {
  events = DASHBOARD_EVENTS.filter(e => FUNNEL_DATA[e.id]);
  selectedEventId = signal(this.events[0]?.id ?? 1);

  selectedEvent = computed(() => this.events.find(e => e.id === this.selectedEventId())!);

  steps: FunnelStep[] = [
    { label: 'Visitas',      key: 'views',     color: '#6366f1', icon: 'eye'      },
    { label: 'Clics',        key: 'clicks',    color: '#a855f7', icon: 'cursor'   },
    { label: 'Checkouts',    key: 'checkouts', color: '#ec4899', icon: 'cart'     },
    { label: 'Compras',      key: 'purchases', color: '#10b981', icon: 'check'    },
  ];

  funnel = computed(() => {
    const data = FUNNEL_DATA[this.selectedEventId()];
    if (!data) return [];
    const top = data.views;
    return this.steps.map((s, i) => {
      const value = data[s.key];
      const prev = i === 0 ? top : data[this.steps[i - 1].key];
      const dropOff = prev > 0 ? Math.round((1 - value / prev) * 100) : 0;
      const widthPct = top > 0 ? Math.round((value / top) * 100) : 0;
      return { ...s, value, dropOff, widthPct };
    });
  });

  conversionRate = computed(() => {
    const data = FUNNEL_DATA[this.selectedEventId()];
    if (!data || data.views === 0) return '0.0';
    return ((data.purchases / data.views) * 100).toFixed(1);
  });

  selectEvent(id: number) { this.selectedEventId.set(id); }

  formatNum(n: number): string {
    return n.toLocaleString('es-AR');
  }
}
