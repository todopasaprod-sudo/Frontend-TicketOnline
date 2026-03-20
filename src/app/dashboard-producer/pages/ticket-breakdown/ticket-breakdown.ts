import { Component, signal, computed } from '@angular/core';
import { DASHBOARD_EVENTS } from '../../data/dashboard-events';
import { TICKET_DATA } from '../../data/analytics-data';

interface TicketRow {
  name: string;
  price: number;
  capacity: number;
  sold: number;
  color: string;
  remaining: number;
  revenue: number;
  occupancyPct: number;
  revenuePct: number;
  soldPct: number;
}

interface DonutSegment {
  color: string;
  dashArray: string;
  dashOffset: number;
}

@Component({
  selector: 'app-ticket-breakdown',
  imports: [],
  templateUrl: './ticket-breakdown.html',
  styleUrl: './ticket-breakdown.scss',
})
export class TicketBreakdown {
  events = DASHBOARD_EVENTS.filter(e => TICKET_DATA[e.id]);
  selectedEventId = signal(this.events[0]?.id ?? 1);

  selectedEvent = computed(() =>
    this.events.find(e => e.id === this.selectedEventId())!
  );

  rows = computed<TicketRow[]>(() => {
    const tiers = TICKET_DATA[this.selectedEventId()] ?? [];
    const totalRevenue = tiers.reduce((s, t) => s + t.price * t.sold, 0);
    const totalSold = tiers.reduce((s, t) => s + t.sold, 0);

    return tiers.map(t => {
      const revenue = t.price * t.sold;
      return {
        ...t,
        remaining: t.capacity - t.sold,
        revenue,
        occupancyPct: t.capacity > 0 ? Math.round((t.sold / t.capacity) * 100) : 0,
        revenuePct: totalRevenue > 0 ? Math.round((revenue / totalRevenue) * 100) : 0,
        soldPct: totalSold > 0 ? Math.round((t.sold / totalSold) * 100) : 0,
      };
    });
  });

  totalRevenue = computed(() => this.rows().reduce((s, r) => s + r.revenue, 0));
  totalSold    = computed(() => this.rows().reduce((s, r) => s + r.sold, 0));
  totalCap     = computed(() => this.rows().reduce((s, r) => s + r.capacity, 0));
  globalOccupancy = computed(() => {
    const cap = this.totalCap();
    return cap > 0 ? Math.round((this.totalSold() / cap) * 100) : 0;
  });
  avgPrice = computed(() => {
    const sold = this.totalSold();
    return sold > 0 ? Math.round(this.totalRevenue() / sold) : 0;
  });
  topTier = computed(() => {
    const rows = this.rows();
    return rows.length ? rows.reduce((best, r) => r.sold > best.sold ? r : best) : null;
  });
  topRevenueTier = computed(() => {
    const rows = this.rows();
    return rows.length ? rows.reduce((best, r) => r.revenue > best.revenue ? r : best) : null;
  });

  // Donut chart — r=70, cx=cy=90, viewBox 180×180
  readonly CIRC = 2 * Math.PI * 70;

  donutSegments = computed<DonutSegment[]>(() => {
    const rows = this.rows();
    const total = this.totalRevenue();
    if (total === 0) return [];

    let cumOffset = 0;
    return rows.map(r => {
      const arcLen = (r.revenue / total) * this.CIRC;
      const seg: DonutSegment = {
        color: r.color,
        dashArray: `${arcLen} ${this.CIRC}`,
        dashOffset: -cumOffset,
      };
      cumOffset += arcLen;
      return seg;
    });
  });

  selectEvent(id: number) { this.selectedEventId.set(id); }

  formatMoney(n: number): string {
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1000) return `$${(n / 1000).toFixed(0)}k`;
    return n === 0 ? 'Gratis' : `$${n}`;
  }

  formatNum(n: number): string {
    return n.toLocaleString('es-AR');
  }
}
