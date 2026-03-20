# README-ANGULAR.md — TicketingApp Frontend

> Guía de arquitectura y convenciones para el frontend Angular 21 de TicketingApp.
> Este documento debe leerse junto a `CLAUDE.md` (backend). Ambos forman el contrato técnico del proyecto.

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Framework | Angular 21 (standalone components) |
| Lenguaje | TypeScript 5.x |
| Estilos | SCSS + CSS Variables |
| HTTP | `HttpClient` con interceptors |
| Estado | Signals (Angular nativo) + `signal()`, `computed()`, `effect()` |
| Formularios | Reactive Forms (`FormBuilder`, `FormGroup`, `Validators`) |
| Routing | Angular Router con lazy loading |
| Autenticación | JWT Bearer almacenado en `localStorage` |
| QR | `ngx-qrcode` o equivalente |
| Build | Angular CLI 21 / Vite |

---

## Arquitectura de la aplicación

La estructura del frontend refleja los **modulos de negocio del backend**, no la estructura de páginas.
Cada feature es un directorio autocontenido con sus propios componentes, servicios, modelos y rutas.

```
src/
├── app/
│   ├── core/                    → Servicios singleton, guards, interceptors, modelos globales
│   │   ├── auth/
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.guard.ts
│   │   │   └── auth.models.ts
│   │   ├── interceptors/
│   │   │   ├── jwt.interceptor.ts
│   │   │   └── error.interceptor.ts
│   │   └── core.providers.ts
│   │
│   ├── shared/                  → Componentes, pipes y directivas reutilizables
│   │   ├── components/
│   │   │   ├── button/
│   │   │   ├── input/
│   │   │   ├── modal/
│   │   │   ├── spinner/
│   │   │   └── ticket-card/
│   │   ├── pipes/
│   │   │   ├── currency-ars.pipe.ts
│   │   │   └── ticket-status.pipe.ts
│   │   └── shared.ts            → Barrel export
│   │
│   ├── features/
│   │   ├── auth/                → Login, registro
│   │   ├── events/              → Listado, detalle, creacion (admin)
│   │   ├── orders/              → Checkout, confirmacion, historial
│   │   ├── tickets/             → Mis tickets, QR, validacion
│   │   └── admin/               → Panel de administracion
│   │
│   ├── layout/                  → Shell de la app (navbar, footer, sidebar admin)
│   │   ├── navbar/
│   │   ├── footer/
│   │   └── admin-shell/
│   │
│   ├── app.routes.ts            → Rutas raiz con lazy loading
│   ├── app.config.ts            → Providers globales (HttpClient, Router, etc.)
│   └── app.component.ts
│
├── environments/
│   ├── environment.ts
│   └── environment.prod.ts
└── styles/
    ├── _variables.scss
    ├── _typography.scss
    └── styles.scss
```

---

## Convenciones de codigo

### Componentes

- Todos los componentes son **standalone** (`standalone: true`).
- Usar `signals` para estado local: `signal()`, `computed()`, `effect()`.
- Evitar `ngOnChanges` cuando se puede usar `computed()`.
- Nombres en `kebab-case` para archivos: `event-card.component.ts`.
- Selector con prefijo `app-`: `selector: 'app-event-card'`.

```typescript
@Component({
  selector: 'app-event-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './event-card.component.html',
})
export class EventCardComponent {
  event = input.required<EventSummaryDto>();
}
```

### Servicios

- Un servicio por feature/recurso del backend: `EventService`, `OrderService`, `TicketService`.
- Los servicios del core son `providedIn: 'root'`; los de feature se proveen en el route.
- Retornar `Observable<T>` desde los servicios HTTP. Nunca suscribirse dentro del servicio.
- Usar `inject()` en lugar de constructor injection donde sea posible.

```typescript
@Injectable({ providedIn: 'root' })
export class EventService {
  private http = inject(HttpClient);
  private apiUrl = inject(API_URL);

  getEvents(): Observable<EventSummaryDto[]> {
    return this.http.get<EventSummaryDto[]>(`${this.apiUrl}/events`);
  }
}
```

### Modelos / DTOs

- Cada feature tiene sus propios modelos TypeScript que **mapean exactamente** los DTOs del backend.
- Usar `interface` para DTOs de respuesta y `type` o `interface` para payloads de request.
- No transformar datos en los servicios; hacerlo en el componente o en un `computed()`.

---

## Autenticacion

### Flujo

```
LoginComponent
  → AuthService.login(dto)
    → POST /api/auth/login
      → { token, userId, email, name, surname, role }
        → localStorage.setItem('token', token)
          → Router.navigate(['/events'])
```

### JWT

El token JWT contiene los claims definidos por el backend:

| Claim .NET | Claim JWT estandar | Uso en Angular |
|---|---|---|
| `NameIdentifier` | `sub` o `nameid` | ID del usuario (`Guid`) |
| `Email` | `email` | Email del usuario |
| `GivenName` | `given_name` | Nombre |
| `Surname` | `family_name` | Apellido |
| `Role` | `role` | Control de acceso por rol |

### AuthService

```typescript
// core/auth/auth.service.ts
@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenKey = 'token';
  currentUser = signal<AuthUser | null>(this.loadUser());

  login(dto: LoginDto): Observable<AuthResultDto> {
    return this.http.post<AuthResultDto>('/api/auth/login', dto).pipe(
      tap(result => {
        localStorage.setItem(this.tokenKey, result.token);
        this.currentUser.set(this.parseToken(result.token));
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }

  isAuthenticated = computed(() => this.currentUser() !== null);
  isAdmin = computed(() => this.currentUser()?.role === 'Admin');
}
```

### JWT Interceptor

Agrega el header `Authorization: Bearer <token>` a todas las requests que van a `/api`.

```typescript
// core/interceptors/jwt.interceptor.ts
export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');
  if (token && req.url.includes('/api')) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }
  return next(req);
};
```

### Error Interceptor

Maneja errores globales: `401` redirige al login, `403` muestra forbidden, `500` muestra toast de error.

```typescript
// core/interceptors/error.interceptor.ts
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) router.navigate(['/auth/login']);
      if (error.status === 500) toast.error('Error interno del servidor');
      return throwError(() => error);
    })
  );
};
```

### Guards

```typescript
// core/auth/auth.guard.ts
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.isAuthenticated() ? true : inject(Router).createUrlTree(['/auth/login']);
};

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.isAdmin() ? true : inject(Router).createUrlTree(['/forbidden']);
};
```

---

## Routing

Lazy loading por feature. Cada feature expone su propio archivo de rutas.

```typescript
// app.routes.ts
export const routes: Routes = [
  { path: '', redirectTo: 'events', pathMatch: 'full' },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES),
  },
  {
    path: 'events',
    loadChildren: () => import('./features/events/events.routes').then(m => m.EVENTS_ROUTES),
  },
  {
    path: 'orders',
    canActivate: [authGuard],
    loadChildren: () => import('./features/orders/orders.routes').then(m => m.ORDERS_ROUTES),
  },
  {
    path: 'tickets',
    canActivate: [authGuard],
    loadChildren: () => import('./features/tickets/tickets.routes').then(m => m.TICKETS_ROUTES),
  },
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES),
  },
];
```

---

## Features

### Auth (`/auth`)

| Ruta | Componente | Backend |
|---|---|---|
| `/auth/login` | `LoginComponent` | `POST /api/auth/login` |
| `/auth/register` | `RegisterComponent` | `POST /api/auth/register` |

**DTOs:**

```typescript
// features/auth/auth.models.ts
export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterUserDto {
  name: string;
  surname: string;
  email: string;
  password: string;
  identificationType: string;
  identificationValue: string;
  phoneNumber: string;
  dateOfBirth: string; // ISO 8601
  gender: string;
  country: string;
}

export interface AuthResultDto {
  token: string;
  userId: string;
  email: string;
  name: string;
  surname: string;
  role: string;
}
```

---

### Events (`/events`)

| Ruta | Componente | Backend |
|---|---|---|
| `/events` | `EventListComponent` | `GET /api/events` |
| `/events/:id` | `EventDetailComponent` | `GET /api/events/:id` |
| `/admin/events/new` | `CreateEventComponent` | `POST /api/events` |
| `/admin/events/:id/edit` | `EditEventComponent` | `PUT /api/events/:id` |

**DTOs:**

```typescript
// features/events/event.models.ts
export interface EventSummaryDto {
  id: string;
  title: string;
  date: string;
  venue: string;
  imageUrl: string;
  minPrice: number;
  isSoldOut: boolean;
}

export interface EventDetailDto extends EventSummaryDto {
  description: string;
  organizerName: string;
  ticketTypes: TicketTypeDto[];
}

export interface TicketTypeDto {
  id: string;
  name: string;
  price: number;
  stock: number;
  maxPerOrder: number;
  validUntil: string;
}

export interface CreateEventDto {
  title: string;
  description: string;
  date: string;
  venue: string;
  imageUrl?: string;
  ticketTypes: CreateTicketTypeDto[];
}

export interface CreateTicketTypeDto {
  name: string;
  price: number;
  stock: number;
  maxPerOrder: number;
  validUntil: string;
}
```

---

### Orders (`/orders`)

| Ruta | Componente | Backend |
|---|---|---|
| `/orders/checkout/:eventId` | `CheckoutComponent` | `POST /api/orders` |
| `/orders/confirm/:orderId` | `OrderConfirmComponent` | `GET /api/orders/:id` |
| `/orders/history` | `OrderHistoryComponent` | `GET /api/orders/mine` |

**DTOs:**

```typescript
// features/orders/order.models.ts
export interface CreateOrderDto {
  items: OrderItemDto[];
}

export interface OrderItemDto {
  ticketTypeId: string;
  quantity: number;
}

export interface OrderDto {
  id: string;
  status: OrderStatus;
  total: number;
  createdAt: string;
  items: OrderItemDetailDto[];
  payment?: PaymentDto;
}

export type OrderStatus = 'Pending' | 'Paid' | 'Cancelled';

export interface OrderItemDetailDto {
  ticketTypeName: string;
  quantity: number;
  unitPrice: number;
}

export interface PaymentDto {
  id: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  method: string;
  paidAt?: string;
}
```

---

### Tickets (`/tickets`)

| Ruta | Componente | Backend |
|---|---|---|
| `/tickets` | `MyTicketsComponent` | `GET /api/tickets/mine` |
| `/tickets/:id` | `TicketDetailComponent` | `GET /api/tickets/:id` |
| `/validate/:qr` | `ValidateTicketComponent` | `POST /api/tickets/validate` |

**DTOs:**

```typescript
// features/tickets/ticket.models.ts
export interface TicketDto {
  id: string;
  eventTitle: string;
  eventDate: string;
  venue: string;
  ticketTypeName: string;
  holderName: string;
  qrCode: string;       // contenido del QR (UUID unico)
  status: TicketStatus;
  issuedAt: string;
}

export type TicketStatus = 'Valid' | 'Used' | 'Cancelled' | 'Expired';

export interface ValidateTicketDto {
  qrCode: string;
}

export interface TicketValidationResultDto {
  isValid: boolean;
  reason?: string;
  ticket?: TicketDto;
  validatedAt?: string;
}
```

---

## Manejo de estado con Signals

Preferir signals sobre RxJS para estado de UI. Usar RxJS solo para operaciones HTTP y streams.

```typescript
// Ejemplo: EventListComponent
export class EventListComponent {
  private eventService = inject(EventService);

  events = signal<EventSummaryDto[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  filteredEvents = computed(() =>
    this.events().filter(e => !e.isSoldOut)
  );

  ngOnInit() {
    this.loadEvents();
  }

  loadEvents() {
    this.loading.set(true);
    this.eventService.getEvents().subscribe({
      next: data => { this.events.set(data); this.loading.set(false); },
      error: err => { this.error.set('No se pudieron cargar los eventos'); this.loading.set(false); }
    });
  }
}
```

---

## Configuracion de entornos

```typescript
// environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api',
};

// environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://api.ticketingapp.com/api',
};
```

Proveer `API_URL` como token de DI en `app.config.ts`:

```typescript
export const API_URL = new InjectionToken<string>('API_URL');

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([jwtInterceptor, errorInterceptor])),
    { provide: API_URL, useValue: environment.apiUrl },
  ],
};
```

---

## Roles y control de acceso

| Rol | Acceso |
|---|---|
| (anonimo) | Listado y detalle de eventos |
| `Customer` | Compra, historial de ordenes, mis tickets |
| `Organizer` | Panel admin: crear/editar sus eventos, ver ventas |
| `Admin` | Todo lo anterior + gestion de usuarios y organizadores |
| `Validator` | Solo modulo de validacion de QR en puerta |

Los roles provienen del claim `role` del JWT. Usar `adminGuard`, `authGuard`, y directivas de rol en templates para controlar visibilidad.

---

## Convenciones de nombres

| Tipo | Convencion | Ejemplo |
|---|---|---|
| Componente | `PascalCase` + sufijo | `EventCardComponent` |
| Servicio | `PascalCase` + sufijo | `OrderService` |
| Guard | `camelCase` + sufijo | `authGuard` |
| Interceptor | `camelCase` + sufijo | `jwtInterceptor` |
| Modelo/DTO | `PascalCase` + sufijo | `CreateOrderDto` |
| Archivo | `kebab-case` | `event-card.component.ts` |
| Ruta lazy | `kebab-case` | `/events`, `/admin/events` |
| Signal | `camelCase` | `isLoading`, `currentUser` |
| Computed | `camelCase` | `filteredEvents`, `isAdmin` |

---

## Reglas que no se violan

- **No logica de negocio en templates.** Solo en componentes o servicios.
- **No llamadas HTTP en componentes.** Siempre a traves de servicios.
- **No hardcodear URLs.** Usar `API_URL` token o el servicio de environment.
- **No `any` en TypeScript.** Tipar todos los DTOs correctamente.
- **No `subscribe()` sin `unsubscribe()` o `takeUntilDestroyed()`.** Evitar memory leaks.
- **No compartir estado mutable entre componentes sin un servicio.**
- **Un componente, una responsabilidad.** Extraer sub-componentes cuando un template supera ~100 lineas.

---

## Comandos utiles

```bash
# Instalar dependencias
npm install

# Servidor de desarrollo
ng serve

# Generar componente standalone
ng generate component features/events/components/event-card --standalone

# Generar servicio
ng generate service features/events/event

# Build produccion
ng build --configuration production

# Tests
ng test
```

---

*Ultima actualizacion: marzo 2026*
