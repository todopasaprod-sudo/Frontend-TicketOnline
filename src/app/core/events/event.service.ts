import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../../app.config';

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

  getById(id: string): Observable<EventDto> {
    return this.http.get<EventDto>(`${this.apiUrl}/events/${id}`);
  }

  update(id: string, dto: CreateEventDto): Observable<EventDto> {
    return this.http.put<EventDto>(`${this.apiUrl}/events/${id}`, dto);
  }

  publish(id: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/events/${id}/publish`, {});
  }
}
