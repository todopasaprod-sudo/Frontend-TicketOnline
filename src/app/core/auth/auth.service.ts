import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { API_URL } from '../../app.config';

export interface RegisterDto {
  email: string;
  name: string;
  surname: string;
  password: string;
  identificationType: string;
  identificationValue: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: string;
  country: string;
  province: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResultDto {
  token: string;
  userId: string;
  email: string;
  name: string;
  surname: string;
  role: string;
}

const TOKEN_KEY = 'token';
const USER_KEY = 'currentUser';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = inject(API_URL);

  currentUser = signal<AuthResultDto | null>(this.loadFromStorage());

  register(dto: RegisterDto): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/auth/register`, dto);
  }

  login(dto: LoginDto): Observable<AuthResultDto> {
    return this.http.post<AuthResultDto>(`${this.apiUrl}/auth/login`, dto).pipe(
      tap((result) => {
        localStorage.setItem(TOKEN_KEY, result.token);
        localStorage.setItem(USER_KEY, JSON.stringify(result));
        this.currentUser.set(result);
      }),
    );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.currentUser.set(null);
  }

  private loadFromStorage(): AuthResultDto | null {
    try {
      const stored = localStorage.getItem(USER_KEY);
      if (!stored) return null;
      return JSON.parse(stored) as AuthResultDto;
    } catch {
      localStorage.removeItem(USER_KEY);
      return null;
    }
  }
}
