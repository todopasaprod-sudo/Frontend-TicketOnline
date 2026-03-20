import { Component, signal, inject, HostListener, ElementRef } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  private authService = inject(AuthService);
  private router = inject(Router);
  private el = inject(ElementRef);

  currentUser = this.authService.currentUser;
  menuOpen = signal(false);
  searchOpen = signal(false);
  dropdownOpen = signal(false);

  get initials(): string {
    const u = this.currentUser();
    if (!u) return '';
    return ((u.name?.[0] ?? '') + (u.surname?.[0] ?? '')).toUpperCase() || '?';
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.el.nativeElement.contains(event.target)) {
      this.dropdownOpen.set(false);
    }
  }

  toggleDropdown() { this.dropdownOpen.update(v => !v); }
  toggleMenu() { this.menuOpen.update(v => !v); }
  toggleSearch() {
    this.searchOpen.update(v => !v);
    if (this.menuOpen()) this.menuOpen.set(false);
  }

  logout() {
    this.authService.logout();
    this.dropdownOpen.set(false);
    this.router.navigate(['/login']);
  }
}
