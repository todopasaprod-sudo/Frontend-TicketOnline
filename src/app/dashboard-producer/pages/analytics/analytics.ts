import { Component, signal, computed } from '@angular/core';
import { DASHBOARD_EVENTS, DashboardEvent } from '../../data/dashboard-events';
import { PERIODS, PERIOD_DATA, MONTHLY_REVENUE } from '../../data/analytics-data';

@Component({
  selector: 'app-analytics',
  imports: [],
  templateUrl: './analytics.html',
  styleUrl: './analytics.scss',
})
export class Analytics {
  periods = PERIODS;
  selectedPeriod = signal(4);

  currentStats = computed(() => PERIOD_DATA[this.selectedPeriod()]);

  monthlyRevenue = MONTHLY_REVENUE;
  maxRevenue = Math.max(...MONTHLY_REVENUE);

  kpis = computed(() => {
    const s = this.currentStats();
    return [
      {
        label: 'Ingresos del período',
        value: this.formatMoney(s.ingresos),
        trend: s.trend.ingresos,
        icon: 'money',
        iconBg: 'rgba(16,185,129,0.15)',
        iconColor: '#34d399',
      },
      {
        label: 'Tickets vendidos',
        value: s.tickets.toLocaleString('es-AR'),
        trend: s.trend.tickets,
        icon: 'ticket',
        iconBg: 'rgba(59,130,246,0.15)',
        iconColor: '#60a5fa',
      },
      {
        label: 'Tasa de ocupación',
        value: s.ocupacion + '%',
        trend: s.trend.ocupacion,
        icon: 'percent',
        iconBg: 'rgba(168,85,247,0.15)',
        iconColor: '#c084fc',
      },
      {
        label: 'Ticket promedio',
        value: this.formatMoney(s.promedio),
        trend: s.trend.promedio,
        icon: 'tag',
        iconBg: 'rgba(249,115,22,0.15)',
        iconColor: '#fb923c',
      },
    ];
  });

  // Tickets by event (top 5)
  ticketsByEvent: DashboardEvent[] = [...DASHBOARD_EVENTS]
    .filter(e => e.ticketsSold > 0)
    .sort((a, b) => b.ticketsSold - a.ticketsSold)
    .slice(0, 5);

  maxTickets = Math.max(...DASHBOARD_EVENTS.map(e => e.ticketsSold));

  // Category breakdown
  categoryStats = [
    { label: 'Música',      tickets: 5610, color: '#a855f7' },
    { label: 'Deportes',    tickets: 4000, color: '#10b981' },
    { label: 'Gastronomía', tickets: 2100, color: '#db2777' },
    { label: 'Teatro',      tickets: 980,  color: '#ef4444' },
    { label: 'Stand Up',    tickets: 420,  color: '#f97316' },
  ];

  totalCategoryTickets = this.categoryStats.reduce((sum, c) => sum + c.tickets, 0);

  // Top events by views
  topByViews: DashboardEvent[] = [...DASHBOARD_EVENTS]
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);

  setPeriod(index: number) { this.selectedPeriod.set(index); }

  barHeightPercent(revenue: number): number {
    return Math.round((revenue / this.maxRevenue) * 100);
  }

  ticketBarPercent(sold: number): number {
    return Math.round((sold / this.maxTickets) * 100);
  }

  categoryPercent(tickets: number): number {
    return Math.round((tickets / this.totalCategoryTickets) * 100);
  }

  conversionRate(event: DashboardEvent): string {
    if (event.views === 0) return '0%';
    return (Math.round((event.ticketsSold / event.views) * 1000) / 10).toFixed(1) + '%';
  }

  formatMoney(amount: number): string {
    return '$' + amount.toLocaleString('es-AR');
  }

  trendLabel(val: number): string {
    return (val > 0 ? '+' : '') + val + '%';
  }
}
