import { Component, signal, inject } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { toSignal, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs';

@Component({
  selector: 'app-dashboard-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './dashboard-shell.html',
  styleUrl: './dashboard-shell.scss',
})
export class DashboardShell {
  sidebarOpen = signal(true);
  statsOpen   = signal(this.isStatsUrl(inject(Router).url));

  private router = inject(Router);

  pageTitle = toSignal(
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      startWith(null),
      map(() => this.getTitleFromUrl(this.router.url))
    ),
    { initialValue: this.getTitleFromUrl(this.router.url) }
  );

  constructor() {
    // Auto-open stats group when navigating to any stats sub-route
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      takeUntilDestroyed()
    ).subscribe(e => {
      if ((e as NavigationEnd).url.includes('/estadisticas/')) {
        this.statsOpen.set(true);
      }
    });
  }

  toggleSidebar() { this.sidebarOpen.update(v => !v); }
  closeSidebar()  { this.sidebarOpen.set(false); }
  toggleStats()   { this.statsOpen.update(v => !v); }

  private isStatsUrl(url: string): boolean {
    return url.includes('/estadisticas/');
  }

  private getTitleFromUrl(url: string): string {
    if (url.includes('/nuevo')) return 'Crear Evento';
    if (/\/eventos\/\d+/.test(url)) return 'Editar Evento';
    if (url.includes('/eventos')) return 'Mis Eventos';
    if (url.includes('/overview')) return 'Dashboard';
    if (url.includes('/estadisticas/resumen')) return 'Resumen';
    if (url.includes('/estadisticas/ventas')) return 'Velocidad de ventas';
    if (url.includes('/estadisticas/embudo')) return 'Embudo de conversión';
    if (url.includes('/estadisticas/comparacion')) return 'Comparación de períodos';
    if (url.includes('/estadisticas/forecast')) return 'Proyección de ventas';
    if (url.includes('/estadisticas/geografia')) return 'Geografía de compradores';
    if (url.includes('/estadisticas/entradas')) return 'Tipos de entrada';
    return 'Dashboard';
  }
}
