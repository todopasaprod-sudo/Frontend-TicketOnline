import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../../app.config';

export interface CartItemRequest {
  ticketTypeId: string;
  quantity: number;
}

export interface BuyerData {
  name: string;
  surname: string;
  email: string;
  phoneNumber: string;
  identificationType: string;
  identificationValue: string;
}

export interface CreateOrderRequest {
  eventId: string;
  cardToken: string;
  installments: number;
  paymentMethodId: string;
  buyerData: BuyerData;
  items: CartItemRequest[];
}

export interface OrderResult {
  orderId: string;
  paymentStatus: 'approved' | 'pending' | 'rejected';
  statusDetail: string | null;
  total: number;
  externalOrderId: string | null;
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private http = inject(HttpClient);
  private apiUrl = inject(API_URL);

  createOrder(request: CreateOrderRequest): Observable<OrderResult> {
    return this.http.post<OrderResult>(`${this.apiUrl}/orders`, request);
  }
}
