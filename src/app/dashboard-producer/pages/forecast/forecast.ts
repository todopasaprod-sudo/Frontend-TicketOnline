import { Component, signal, computed } from '@angular/core';
import { DASHBOARD_EVENTS, DashboardEvent } from '../../data/dashboard-events';

// Days of history simulated (represents "today" = day 30)
const HISTORY_DAYS = 30;

// Simulated days remaining until the event date for each active event
const DAYS_UNTIL_EVENT: Record<number, number> = {
  1: 18,  // Lollapalooza — close
  2: 35,  // Cosquín Rock — mid
  4: 55,  // El Rey León — plenty of time
  7: 88,  // Nicki Nicole — early stage
};

const DAILY_WEIGHTS = [
  0.005, 0.006, 0.008, 0.010, 0.012, 0.015, 0.020, 0.025, 0.022, 0.018,
  0.016, 0.020, 0.025, 0.030, 0.028, 0.026, 0.030, 0.035, 0.040, 0.038,
  0.042, 0.045, 0.050, 0.048, 0.042, 0.040, 0.038, 0.035, 0.030, 0.025,
];

function generateHistory(eventId: number, total: number): number[] {
  const seed = eventId * 137;
  return DAILY_WEIGHTS.map((w, d) => {
    const jitter = 1 + ((seed * (d + 1)) % 40 - 20) / 100;
    return Math.max(0, Math.round(total * w * jitter));
  });
}

export type RiskLevel = 'on-track' | 'moderate' | 'at-risk';

@Component({
  selector: 'app-forecast',
  imports: [],
  templateUrl: './forecast.html',
  styleUrl: './forecast.scss',
})
export class Forecast {
  readonly Math = Math;
  // Only show events where forecast makes sense
  events: DashboardEvent[] = DASHBOARD_EVENTS.filter(
    e => e.status === 'publicado' && e.ticketsSold < e.ticketsTotal
  );

  selectedEventId = signal(this.events[0]?.id ?? 1);
  selectedEvent = computed(() => this.events.find(e => e.id === this.selectedEventId())!);

  // Daily history (30 days)
  history = computed(() => {
    const ev = this.selectedEvent();
    return generateHistory(ev.id, ev.ticketsSold);
  });

  // Cumulative history
  cumulative = computed(() => {
    let sum = 0;
    return this.history().map(d => (sum += d));
  });

  // Avg velocity based on last 7 days
  velocity = computed(() => {
    const h = this.history();
    const last7 = h.slice(-7);
    return last7.reduce((s, v) => s + v, 0) / 7;
  });

  // Days until event
  daysUntilEvent = computed(() => DAYS_UNTIL_EVENT[this.selectedEventId()] ?? 60);

  // Total remaining tickets
  remaining = computed(() => {
    const ev = this.selectedEvent();
    return ev.ticketsTotal - ev.ticketsSold;
  });

  // Projected day (from day 30) when sellout happens
  projectedSelloutDayOffset = computed(() => {
    const vel = this.velocity();
    if (vel <= 0) return Infinity;
    return Math.ceil(this.remaining() / vel);
  });

  // Absolute projected sellout day (from day 1)
  projectedSelloutDay = computed(() =>
    HISTORY_DAYS + this.projectedSelloutDayOffset()
  );

  // Projected tickets sold by event day
  projectedTicketsByEvent = computed(() => {
    const ev = this.selectedEvent();
    const additional = Math.round(this.velocity() * this.daysUntilEvent());
    return Math.min(ev.ticketsSold + additional, ev.ticketsTotal);
  });

  projectedPctByEvent = computed(() => {
    const ev = this.selectedEvent();
    return Math.round((this.projectedTicketsByEvent() / ev.ticketsTotal) * 100);
  });

  risk = computed((): RiskLevel => {
    const pct = this.projectedPctByEvent();
    if (pct >= 95) return 'on-track';
    if (pct >= 65) return 'moderate';
    return 'at-risk';
  });

  projectedRevenue = computed(() => {
    const ev = this.selectedEvent();
    if (!ev.price) return null;
    return this.projectedTicketsByEvent() * ev.price;
  });

  // ── SVG Chart ────────────────────────────────────────────────────────────────
  // X axis: days 1 to (eventDay = HISTORY_DAYS + daysUntilEvent), capped at 120
  // Y axis: 0 to ticketsTotal

  private readonly SVG_W = 600;
  private readonly SVG_H = 160;
  private readonly PAD_L = 4;
  private readonly PAD_R = 8;
  private readonly PAD_T = 12;
  private readonly PAD_B = 8;

  totalDays = computed(() => Math.min(HISTORY_DAYS + this.daysUntilEvent(), 120));

  private px(day: number): number {
    const usable = this.SVG_W - this.PAD_L - this.PAD_R;
    return this.PAD_L + (day / this.totalDays()) * usable;
  }

  private py(tickets: number, max: number): number {
    const usable = this.SVG_H - this.PAD_T - this.PAD_B;
    return this.SVG_H - this.PAD_B - (tickets / max) * usable;
  }

  // Solid line: actual cumulative (days 1–30)
  actualPath = computed(() => {
    const cum = this.cumulative();
    const max = this.selectedEvent().ticketsTotal;
    return cum.map((v, i) => {
      const x = this.px(i + 1).toFixed(1);
      const y = this.py(v, max).toFixed(1);
      return (i === 0 ? 'M' : 'L') + x + ',' + y;
    }).join(' ');
  });

  // Area under actual line
  actualArea = computed(() => {
    const cum = this.cumulative();
    const max = this.selectedEvent().ticketsTotal;
    const pts = cum.map((v, i) => {
      const x = this.px(i + 1).toFixed(1);
      const y = this.py(v, max).toFixed(1);
      return (i === 0 ? 'M' : 'L') + x + ',' + y;
    }).join(' ');
    const lastX = this.px(HISTORY_DAYS).toFixed(1);
    const firstX = this.px(1).toFixed(1);
    const bottom = (this.SVG_H - this.PAD_B).toFixed(1);
    return `${pts} L${lastX},${bottom} L${firstX},${bottom} Z`;
  });

  // Dashed projected line: from day 30 to eventDay or selloutDay
  projectedPath = computed(() => {
    const ev = this.selectedEvent();
    const max = ev.ticketsTotal;
    const vel = this.velocity();
    const startCum = ev.ticketsSold;
    const endDay = Math.min(HISTORY_DAYS + this.daysUntilEvent(), this.projectedSelloutDay(), 120);
    const startX = this.px(HISTORY_DAYS).toFixed(1);
    const startY = this.py(startCum, max).toFixed(1);

    const points: string[] = [`M${startX},${startY}`];
    for (let d = HISTORY_DAYS + 1; d <= endDay; d++) {
      const daysFromNow = d - HISTORY_DAYS;
      const projected = Math.min(startCum + vel * daysFromNow, max);
      const x = this.px(d).toFixed(1);
      const y = this.py(projected, max).toFixed(1);
      points.push(`L${x},${y}`);
    }
    return points.join(' ');
  });

  // Capacity line Y position
  capacityLineY = computed(() => {
    const ev = this.selectedEvent();
    return this.py(ev.ticketsTotal, ev.ticketsTotal).toFixed(1);
  });

  // Event day X position
  eventDayX = computed(() =>
    this.px(HISTORY_DAYS + this.daysUntilEvent()).toFixed(1)
  );

  // Sellout day X (if within chart range)
  selloutX = computed(() => {
    const day = this.projectedSelloutDay();
    if (day > this.totalDays()) return null;
    return this.px(day).toFixed(1);
  });

  selectEvent(id: number) { this.selectedEventId.set(id); }

  formatMoney(n: number): string {
    return '$' + n.toLocaleString('es-AR');
  }

  formatNum(n: number): string {
    return n.toLocaleString('es-AR');
  }

  riskLabel(): string {
    switch (this.risk()) {
      case 'on-track': return 'En camino al agotamiento';
      case 'moderate': return 'Ritmo moderado';
      case 'at-risk':  return 'En riesgo de baja venta';
    }
  }
}
