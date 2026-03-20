import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DASHBOARD_EVENTS, DashboardEvent, EventStatus } from '../../data/dashboard-events';

@Component({
  selector: 'app-overview',
  imports: [RouterLink],
  templateUrl: './overview.html',
  styleUrl: './overview.scss',
})
export class Overview {
  stats = [
    {
      label: 'Eventos Publicados',
      value: '8',
      trend: '+2 este mes',
      trendUp: true,
      iconBg: 'rgba(168,85,247,0.15)',
      iconColor: '#c084fc',
      icon: 'calendar',
    },
    {
      label: 'Tickets Vendidos',
      value: '8.710',
      trend: '+12% vs. mes anterior',
      trendUp: true,
      iconBg: 'rgba(59,130,246,0.15)',
      iconColor: '#60a5fa',
      icon: 'ticket',
    },
    {
      label: 'Ingresos del Mes',
      value: '$1.245.000',
      trend: '+8% vs. mes anterior',
      trendUp: true,
      iconBg: 'rgba(16,185,129,0.15)',
      iconColor: '#34d399',
      icon: 'money',
    },
    {
      label: 'Vistas Totales',
      value: '81.830',
      trend: '-3% vs. mes anterior',
      trendUp: false,
      iconBg: 'rgba(249,115,22,0.15)',
      iconColor: '#fb923c',
      icon: 'eye',
    },
  ];

  recentEvents: DashboardEvent[] = DASHBOARD_EVENTS.slice(0, 5);

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
}
