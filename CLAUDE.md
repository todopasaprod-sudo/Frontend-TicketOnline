# CLAUDE-ANGULAR.md

This file provides guidance to Claude Code when working with the Angular 21 frontend of TicketingApp.
Read alongside `CLAUDE.md` (backend). Both form the full technical contract of the project.

## Commands

```bash
npm install
ng serve          # dev server en :4200, backend esperado en :5000
ng build --configuration production
ng test
ng test --include="**/auth.service.spec.ts"
```

Prerequisites: Backend corriendo en `http://localhost:5000`. Angular CLI 21 instalado globalmente.

## Estructura real actual

```
src/app/
├── app.ts                    → AppComponent — solo RouterOutlet
├── app.config.ts             → Solo provideRouter(routes). Sin HttpClient, sin interceptores
├── app.routes.ts             → Rutas raíz: /eventos, /registro, /login, /dashboard (lazy)
├── layout/
│   ├── pages/
│   │   ├── login/            → Formulario reactivo. onSubmit() tiene setTimeout fake, sin HTTP
│   │   ├── register/         → Formulario reactivo. onSubmit() tiene setTimeout fake, sin HTTP
│   │   └── main-page-events/ → Listado público de eventos con datos hardcodeados en el mismo archivo
│   └── components/
│       ├── navbar/           → Sin estado de auth. Solo RouterLink/RouterLinkActive
│       └── event-card/       → Componente presentacional. Recibe EventData via input.required<>()
└── dashboard-producer/
    ├── dashboard.routes.ts   → Rutas lazy con producerGuard (siempre retorna true — TODO)
    ├── guards/
    │   └── producer.guard.ts → Stub: retorna true. Pendiente conectar con AuthService
    ├── data/
    │   ├── dashboard-events.ts → Datos mock: DashboardEvent[], GRADIENTS[], EventStatus type
    │   └── analytics-data.ts   → Datos mock: PERIOD_DATA, TICKET_DATA, FUNNEL_DATA, etc.
    ├── layout/
    │   └── dashboard-shell/  → Sidebar + RouterOutlet. Usa toSignal + takeUntilDestroyed
    └── pages/
        ├── overview/         → Stats + eventos recientes (hardcoded desde dashboard-events.ts)
        ├── events-list/      → Listado con filtros y delete local (sobre signal, no persiste)
        ├── event-form/       → Crear/editar evento. Carga desde mock, guarda con setTimeout fake
        ├── analytics/
        ├── sales-velocity/
        ├── funnel/
        ├── comparison/
        ├── forecast/
        ├── geography/
        └── ticket-breakdown/
```

## Estado actual

| Sección | UI | Conectado al backend |
|---|---|---|
| Login | Hecho | No — setTimeout fake |
| Register | Hecho | No — setTimeout fake |
| Listado de eventos (público) | Hecho | No — datos hardcoded en el componente |
| Dashboard producer — shell/nav | Hecho | No |
| Dashboard — overview | Hecho | No — stats hardcoded |
| Dashboard — events-list | Hecho | No — datos mock, delete local |
| Dashboard — event-form | Hecho | No — carga/guarda con setTimeout fake |
| Dashboard — analytics/stats | Hecho (UI) | No — datos mock en analytics-data.ts |
| AuthService | No existe | — |
| EventService | No existe | — |
| HTTP interceptors (JWT, error) | No existen | — |
| Guards funcionales reales | No existen | producerGuard siempre true |
| API_URL token | No existe | — |
| provideHttpClient | No existe | — |

## Lo que falta para conectar el frontend al backend

1. `app.config.ts` — agregar `provideHttpClient(withInterceptors([jwtInterceptor, errorInterceptor]))` y el token `API_URL`
2. `core/auth/jwt.interceptor.ts` — adjunta `Bearer <token>` a requests que incluyan `/api`
3. `core/auth/error.interceptor.ts` — redirige a `/login` en 401
4. `core/auth/auth.service.ts` — maneja login/register, almacena token en localStorage, expone `currentUser` signal
5. Conectar `Login` y `Register` a `AuthService`
6. `core/events/event.service.ts` — CRUD de eventos via HTTP
7. Reemplazar datos hardcoded en `MainPageEvents` y `dashboard-producer/` con llamadas al `EventService`
8. Actualizar `producerGuard` para verificar rol desde `AuthService`
9. Actualizar `Navbar` para mostrar estado de auth desde `AuthService.currentUser`

## Patrones establecidos en el código existente

### Componente standalone

En Angular 21, `standalone: true` es el default — no hace falta declararlo. El proyecto no lo incluye en ningún componente existente.

```typescript
@Component({
  selector: 'app-mi-componente',
  imports: [RouterLink],
  templateUrl: './mi-componente.html',
  styleUrl: './mi-componente.scss',
})
export class MiComponente { }
```

### Signals para estado local

```typescript
export class MiComponente {
  items    = signal<ItemDto[]>([]);
  loading  = signal(false);
  error    = signal<string | null>(null);

  filtered = computed(() => this.items().filter(i => i.activo));
}
```

### input() signal-based (usado en EventCard)

```typescript
export class EventCard {
  event = input.required<EventData>();
}
```

### toSignal + takeUntilDestroyed (usado en DashboardShell)

```typescript
export class DashboardShell {
  private router = inject(Router);

  pageTitle = toSignal(
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(() => this.getTitleFromUrl(this.router.url))
    ),
    { initialValue: '' }
  );

  constructor() {
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      takeUntilDestroyed()
    ).subscribe(e => { /* ... */ });
  }
}
```

### Formularios reactivos (patrón de login/register)

```typescript
export class Login {
  private fb = inject(FormBuilder);
  isLoading = signal(false);

  form = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  isInvalid(name: string): boolean {
    const c = this.form.get(name);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }
}
```

### Servicio HTTP (patrón a implementar)

```typescript
@Injectable({ providedIn: 'root' })
export class EventService {
  private http = inject(HttpClient);
  private apiUrl = inject(API_URL);

  getEvents(): Observable<EventDto[]> {
    return this.http.get<EventDto[]>(`${this.apiUrl}/events`);
  }
}
```

### Lazy routing (patrón de dashboard.routes.ts)

```typescript
export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    canActivate: [producerGuard],
    loadComponent: () => import('./layout/shell').then(m => m.Shell),
    children: [
      {
        path: 'seccion',
        loadComponent: () => import('./pages/seccion/seccion').then(m => m.Seccion),
      },
    ],
  },
];
```

## Auth flow (a implementar)

```
Login.onSubmit() → AuthService.login(dto)
  → POST /api/auth/login
  → { token, userId, email, name, surname, role }
  → localStorage.setItem('token', token)
  → currentUser signal actualizado
  → navigate to /eventos
```

JWT claims que emite el backend:

| Claim .NET | Clave JWT | Uso |
|---|---|---|
| `NameIdentifier` | `nameid` | User ID (Guid) |
| `Email` | `email` | Display |
| `GivenName` | `given_name` | Display |
| `Surname` | `family_name` | Display |
| `Role` | `role` | Guards / UI |

Cargar token en el constructor de `AuthService` para que `currentUser` esté disponible después de un refresh.

## API_URL token (a implementar)

```typescript
// app.config.ts
export const API_URL = new InjectionToken<string>('API_URL');

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([jwtInterceptor, errorInterceptor])),
    { provide: API_URL, useValue: 'http://localhost:5000/api' },
  ],
};
```

Nunca hardcodear la URL base en servicios. Siempre usar `inject(API_URL)`.

## Modelos / DTOs

Interfaces 1:1 con los DTOs del backend. Sin renombrar campos en la capa de modelo.

Los tipos locales existentes (`EventData` en event-card, `DashboardEvent` en dashboard-events.ts) son mocks UI y deben reemplazarse por DTOs del backend al conectar.

## Convenciones del proyecto

- Sin NgModules — todo standalone
- No `standalone: true` explícito (es el default en Angular 17+)
- Signals para estado (`signal`, `computed`) — no Subject/BehaviorSubject para estado de componente
- `inject()` en lugar de constructor DI donde sea posible
- `takeUntilDestroyed()` en todo `subscribe()` dentro de componentes de larga vida
- Sin HTTP en componentes — siempre a través de un servicio
- Sin `any` en TypeScript
- Sin URLs hardcodeadas
- Control flow moderno en templates: `@if`, `@for`, `@switch` (no `*ngIf`, `*ngFor`)
- Prettier configurado (printWidth: 100, singleQuote: true)

## Pitfalls conocidos

| Problema | Causa | Fix |
|---|---|---|
| `currentUser` null después de refresh | Token no cargado en init | Cargar en constructor de AuthService desde localStorage |
| Requests sin JWT | URL no contiene `/api` | Usar siempre `API_URL` token como base |
| Memory leak en subscribe | Sin unsubscribe | `takeUntilDestroyed()` en componentes |
| `No provider for API_URL` | Token no registrado | Agregar en `app.config.ts` providers |
| CORS error en dev | Backend no permite origen Angular | CORS ya configurado en backend para `:4200` |
