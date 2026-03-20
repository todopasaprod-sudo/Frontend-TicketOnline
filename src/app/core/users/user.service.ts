import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../../app.config';

export interface UserDto {
  id: string;
  email: string;
  name: string;
  surname: string;
  identificationType: string;
  identificationValue: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: string;
  country: string;
  province: string;
  role: string;
  createdAt: string;
}

export interface UpdateUserDto {
  phoneNumber?: string;
  gender?: string;
  province?: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = inject(API_URL);

  getProfile(): Observable<UserDto> {
    return this.http.get<UserDto>(`${this.apiUrl}/users/me`);
  }

  updateProfile(dto: UpdateUserDto): Observable<UserDto> {
    return this.http.put<UserDto>(`${this.apiUrl}/users/me`, dto);
  }
}
