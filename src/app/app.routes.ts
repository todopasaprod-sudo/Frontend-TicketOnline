import { Routes } from '@angular/router';
import { Register } from './layout/pages/register/register';
import { Login } from './layout/pages/login/login';
import { MainPageEvents } from './layout/pages/main-page-events/main-page-events';
import { MisDatos } from './layout/pages/mis-datos/mis-datos';

export const routes: Routes = [
  { path: 'eventos', component: MainPageEvents },
  { path: 'registro', component: Register },
  { path: 'login', component: Login },
  { path: 'mis-datos', component: MisDatos },
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./dashboard-producer/dashboard.routes').then(m => m.DASHBOARD_ROUTES),
  },
  { path: '', redirectTo: 'eventos', pathMatch: 'full' },
];
