import { Routes } from '@angular/router';
import { producerGuard } from './guards/producer.guard';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    canActivate: [producerGuard],
    loadComponent: () =>
      import('./layout/dashboard-shell/dashboard-shell').then(m => m.DashboardShell),
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      {
        path: 'overview',
        loadComponent: () =>
          import('./pages/overview/overview').then(m => m.Overview),
      },
      {
        path: 'eventos',
        loadComponent: () =>
          import('./pages/events-list/events-list').then(m => m.EventsList),
      },
      {
        path: 'eventos/nuevo',
        loadComponent: () =>
          import('./pages/event-form/event-form').then(m => m.EventForm),
      },
      {
        path: 'eventos/:id',
        loadComponent: () =>
          import('./pages/event-form/event-form').then(m => m.EventForm),
      },
      { path: 'estadisticas', redirectTo: 'estadisticas/resumen', pathMatch: 'full' },
      {
        path: 'estadisticas/resumen',
        loadComponent: () =>
          import('./pages/analytics/analytics').then(m => m.Analytics),
      },
      {
        path: 'estadisticas/ventas',
        loadComponent: () =>
          import('./pages/sales-velocity/sales-velocity').then(m => m.SalesVelocity),
      },
      {
        path: 'estadisticas/embudo',
        loadComponent: () =>
          import('./pages/funnel/funnel').then(m => m.Funnel),
      },
      {
        path: 'estadisticas/comparacion',
        loadComponent: () =>
          import('./pages/comparison/comparison').then(m => m.Comparison),
      },
      {
        path: 'estadisticas/forecast',
        loadComponent: () =>
          import('./pages/forecast/forecast').then(m => m.Forecast),
      },
      {
        path: 'estadisticas/geografia',
        loadComponent: () =>
          import('./pages/geography/geography').then(m => m.Geography),
      },
    ],
  },
];
