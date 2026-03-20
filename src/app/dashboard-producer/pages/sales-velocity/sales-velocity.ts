import { Component, signal, computed } from '@angular/core';
import { DASHBOARD_EVENTS } from '../../data/dashboard-events';

interface DailySale { day: number; tickets: number; revenue: number; }

// Simulated daily sales per event (30 days)
function generateDailySales(eventId: number, total: number): DailySale[] {
  const days: DailySale[] = [];
  const weights = [
    0.005, 0.006, 0.008, 0.010, 0.012, 0.015, 0.020, 0.025, 0.022, 0.018,
    0.016, 0.020, 0.025, 0.030, 0.028, 0.026, 0.030, 0.035, 0.040, 0.038,
    0.042, 0.045, 0.050, 0.048, 0.042, 0.040, 0.038, 0.035, 0.030, 0.025,
  ];
  const seed = eventId * 137;
  let cumulative = 0;
  for (let d = 0; d < 30; d++) {
    const jitter = 1 + ((seed * (d + 1)) % 40 - 20) / 100;
    const dayTickets = Math.round(total * weights[d] * jitter);
    cumulative += dayTickets;
    days.push({ day: d + 1, tickets: dayTickets, revenue: dayTickets });
  }
  return days;
}

@Component({
  selector: 'app-sales-velocity',
  imports: [],
  templateUrl: './sales-velocity.html',
  styleUrl: './sales-velocity.scss',
})
export class SalesVelocity {
  events = DASHBOARD_EVENTS.filter(e => e.ticketsSold > 0);
  selectedEventId = signal(this.events[0]?.id ?? 1);

  selectedEvent = computed(() => this.events.find(e => e.id === this.selectedEventId())!);

  dailySales = computed(() => {
    const ev = this.selectedEvent();
    return generateDailySales(ev.id, ev.ticketsSold);
  });

  cumulativeSales = computed(() => {
    let cum = 0;
    return this.dailySales().map(d => {
      cum += d.tickets;
      return cum;
    });
  });

  maxDaily = computed(() => Math.max(...this.dailySales().map(d => d.tickets), 1));
  maxCumulative = computed(() => Math.max(...this.cumulativeSales(), 1));

  // SVG path for cumulative line chart
  svgPath = computed(() => {
    const data = this.cumulativeSales();
    const w = 600;
    const h = 160;
    const pad = 8;
    const max = this.maxCumulative();

    return data.map((v, i) => {
      const x = pad + (i / (data.length - 1)) * (w - pad * 2);
      const y = h - pad - ((v / max) * (h - pad * 2));
      return (i === 0 ? 'M' : 'L') + x.toFixed(1) + ',' + y.toFixed(1);
    }).join(' ');
  });

  svgArea = computed(() => {
    const data = this.cumulativeSales();
    const w = 600;
    const h = 160;
    const pad = 8;
    const max = this.maxCumulative();

    const line = data.map((v, i) => {
      const x = pad + (i / (data.length - 1)) * (w - pad * 2);
      const y = h - pad - ((v / max) * (h - pad * 2));
      return (i === 0 ? 'M' : 'L') + x.toFixed(1) + ',' + y.toFixed(1);
    }).join(' ');

    const lastX = (pad + (1) * (w - pad * 2)).toFixed(1);
    const firstX = pad.toFixed(1);
    return `${line} L${lastX},${(h - pad).toFixed(1)} L${firstX},${(h - pad).toFixed(1)} Z`;
  });

  // Stats
  totalRevenue = computed(() => {
    const ev = this.selectedEvent();
    return ev.price ? ev.ticketsSold * ev.price : 0;
  });

  avgDailyTickets = computed(() => {
    const sales = this.dailySales();
    return Math.round(sales.reduce((s, d) => s + d.tickets, 0) / sales.length);
  });

  peakDay = computed(() => {
    const sales = this.dailySales();
    const max = Math.max(...sales.map(d => d.tickets));
    const idx = sales.findIndex(d => d.tickets === max);
    return { day: idx + 1, tickets: max };
  });

  selectEvent(id: number) { this.selectedEventId.set(id); }

  barHeight(tickets: number): number {
    return Math.round((tickets / this.maxDaily()) * 100);
  }

  formatMoney(n: number): string {
    return '$' + n.toLocaleString('es-AR');
  }
}
