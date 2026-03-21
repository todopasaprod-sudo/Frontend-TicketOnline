import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../../app.config';

export interface CreateTicketTypeDto {
  name: string;
  description?: string;
  price: number;
  stock?: number;
  maxPerOrder?: number;
  packageSize?: number;
  sectionLabel?: string;
  badge?: string;
  isActive?: boolean;
  saleStartDate?: string;
  saleEndDate?: string;
  sortOrder?: number;
}

export interface TicketTypeDto {
  id: string;
  eventId: string;
  sectionLabel?: string;
  badge?: string;
  name: string;
  description?: string;
  price: number;
  stock?: number;
  soldCount: number;
  availableStock?: number;
  maxPerOrder: number;
  packageSize: number;
  isActive: boolean;
  saleStartDate?: string;
  saleEndDate?: string;
  sortOrder: number;
  isAvailable: boolean;
  createdAt: string;
}

export interface CreateEventDto {
  name: string;
  description?: string;
  date: string;
  time: string;
  endTime?: string;
  venue: string;
  address: string;
  city: string;
  organizerName: string;
  imageUrl?: string;
  minAge?: number;
  category?: string;
  price?: number;
  capacity?: number;
  ticketTypes: CreateTicketTypeDto[];
}

export interface UpdateEventDto {
  name: string;
  description?: string;
  date: string;
  time: string;
  endTime?: string;
  venue: string;
  address: string;
  city: string;
  organizerName: string;
  imageUrl?: string;
  minAge?: number;
  category?: string;
  price?: number;
  capacity?: number;
}

export interface EventDto {
  id: string;
  name: string;
  description?: string;
  date: string;
  time: string;
  endTime?: string;
  venue: string;
  address: string;
  city: string;
  organizerName: string;
  imageUrl?: string;
  minAge?: number;
  category?: string;
  price?: number;
  capacity?: number;
  createdByUserId: string;
  status: string;
  slug?: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class EventService {
  private http = inject(HttpClient);
  private apiUrl = inject(API_URL);

  create(dto: CreateEventDto): Observable<EventDto> {
    return this.http.post<EventDto>(`${this.apiUrl}/events`, dto);
  }

  getPublished(): Observable<EventDto[]> {
    return this.http.get<EventDto[]>(`${this.apiUrl}/events`);
  }

  getMyEvents(): Observable<EventDto[]> {
    return this.http.get<EventDto[]>(`${this.apiUrl}/events/my`);
  }

  getById(id: string): Observable<EventDto> {
    return this.http.get<EventDto>(`${this.apiUrl}/events/${id}`);
  }

  update(id: string, dto: UpdateEventDto): Observable<EventDto> {
    return this.http.put<EventDto>(`${this.apiUrl}/events/${id}`, dto);
  }

  publish(id: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/events/${id}/publish`, {});
  }

  cancel(id: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/events/${id}/cancel`, {});
  }

  getTicketTypes(eventId: string): Observable<TicketTypeDto[]> {
    return this.http.get<TicketTypeDto[]>(`${this.apiUrl}/events/${eventId}/ticket-types`);
  }
}
