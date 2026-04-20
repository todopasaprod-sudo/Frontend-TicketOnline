import { ApplicationConfig, InjectionToken, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { jwtInterceptor } from './core/auth/jwt.interceptor';

import { routes } from './app.routes';

export const API_URL = new InjectionToken<string>('API_URL');
export const MP_PUBLIC_KEY = new InjectionToken<string>('MP_PUBLIC_KEY');

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([jwtInterceptor])),
    { provide: API_URL, useValue: 'https://localhost:7020/api' },
    { provide: MP_PUBLIC_KEY, useValue: 'APP_USR-e11fb8df-4840-42d1-b6ee-f4a8f14293a7' },
  ],
};
