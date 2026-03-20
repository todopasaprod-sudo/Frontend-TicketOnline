import { Component, input } from '@angular/core';

export interface EventData {
  id: number;
  title: string;
  category: string;
  date: string;
  time: string;
  venue: string;
  city: string;
  price: number | null;
  gradient: string;
  isNew?: boolean;
  isSoldOut?: boolean;
  isFeatured?: boolean;
}

@Component({
  selector: 'app-event-card',
  imports: [],
  templateUrl: './event-card.html',
  styleUrl: './event-card.scss',
})
export class EventCard {
  event = input.required<EventData>();

  formatPrice(price: number): string {
    return price.toLocaleString('es-AR');
  }
}
