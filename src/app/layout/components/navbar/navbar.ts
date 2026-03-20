import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  menuOpen = signal(false);
  searchOpen = signal(false);

  toggleMenu() { this.menuOpen.update(v => !v); }
  toggleSearch() {
    this.searchOpen.update(v => !v);
    if (this.menuOpen()) this.menuOpen.set(false);
  }
}
