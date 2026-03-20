import { Component, signal, computed } from '@angular/core';
import { Navbar } from '../../components/navbar/navbar';
import { EventCard, EventData } from '../../components/event-card/event-card';

const CATEGORIES = ['Todos', 'Música', 'Teatro', 'Deportes', 'Stand Up', 'Arte', 'Gastronomía', 'Infantil'];

const EVENTS: EventData[] = [
  {
    id: 1,
    title: 'Lollapalooza Argentina 2025',
    category: 'Música',
    date: '28 Mar',
    time: '12:00 hs',
    venue: 'Hipódromo de San Isidro',
    city: 'Buenos Aires',
    price: 75000,
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)',
    isFeatured: true,
  },
  {
    id: 2,
    title: 'Cosquín Rock 2025',
    category: 'Música',
    date: '5 Abr',
    time: '15:00 hs',
    venue: 'Anfiteatro Manuel Belgrano',
    city: 'Cosquín',
    price: 45000,
    gradient: 'linear-gradient(135deg, #be185d 0%, #7c3aed 100%)',
    isNew: true,
  },
  {
    id: 3,
    title: 'Diego Capusotto - Stand Up',
    category: 'Stand Up',
    date: '12 Abr',
    time: '21:30 hs',
    venue: 'Teatro Gran Rex',
    city: 'Buenos Aires',
    price: 18000,
    gradient: 'linear-gradient(135deg, #b45309 0%, #d97706 100%)',
  },
  {
    id: 4,
    title: 'El Rey León - Musical',
    category: 'Teatro',
    date: '19 Abr',
    time: '20:00 hs',
    venue: 'Teatro Colón',
    city: 'Buenos Aires',
    price: 22000,
    gradient: 'linear-gradient(135deg, #7c2d12 0%, #dc2626 100%)',
    isNew: true,
  },
  {
    id: 5,
    title: 'River vs Boca - Superclásico',
    category: 'Deportes',
    date: '27 Abr',
    time: '18:00 hs',
    venue: 'Estadio Monumental',
    city: 'Buenos Aires',
    price: 35000,
    gradient: 'linear-gradient(135deg, #065f46 0%, #059669 100%)',
    isSoldOut: true,
  },
  {
    id: 6,
    title: 'Feria del Vino - Mendoza',
    category: 'Gastronomía',
    date: '3 May',
    time: '11:00 hs',
    venue: 'Centro de Congresos',
    city: 'Mendoza',
    price: null,
    gradient: 'linear-gradient(135deg, #831843 0%, #db2777 100%)',
    isNew: true,
  },
  {
    id: 7,
    title: 'Cirque du Soleil - Alegría',
    category: 'Arte',
    date: '10 May',
    time: '20:30 hs',
    venue: 'Costa Salguero',
    city: 'Buenos Aires',
    price: 55000,
    gradient: 'linear-gradient(135deg, #1e40af 0%, #7c3aed 100%)',
  },
  {
    id: 8,
    title: 'Flor de Lis - Espectáculo Infantil',
    category: 'Infantil',
    date: '17 May',
    time: '15:00 hs',
    venue: 'Estadio Luna Park',
    city: 'Buenos Aires',
    price: 12000,
    gradient: 'linear-gradient(135deg, #5b21b6 0%, #a855f7 100%)',
  },
  {
    id: 9,
    title: 'Festival Internacional de Jazz',
    category: 'Música',
    date: '24 May',
    time: '19:00 hs',
    venue: 'Usina del Arte',
    city: 'Buenos Aires',
    price: null,
    gradient: 'linear-gradient(135deg, #0f4c75 0%, #1b6ca8 100%)',
  },
  {
    id: 10,
    title: 'Hamlet - Shakespeare',
    category: 'Teatro',
    date: '31 May',
    time: '21:00 hs',
    venue: 'Teatro San Martín',
    city: 'Buenos Aires',
    price: 9500,
    gradient: 'linear-gradient(135deg, #4a0e0e 0%, #991b1b 100%)',
    isNew: true,
  },
  {
    id: 11,
    title: 'Nicki Nicole - Gira Argentina',
    category: 'Música',
    date: '7 Jun',
    time: '21:00 hs',
    venue: 'Movistar Arena',
    city: 'Buenos Aires',
    price: 28000,
    gradient: 'linear-gradient(135deg, #4c1d95 0%, #ec4899 100%)',
  },
  {
    id: 12,
    title: 'Torneo Abierto de Pádel',
    category: 'Deportes',
    date: '14 Jun',
    time: '09:00 hs',
    venue: 'Club Náutico San Isidro',
    city: 'San Isidro',
    price: 5000,
    gradient: 'linear-gradient(135deg, #064e3b 0%, #10b981 100%)',
  },
];

@Component({
  selector: 'app-main-page-events',
  imports: [Navbar, EventCard],
  templateUrl: './main-page-events.html',
  styleUrl: './main-page-events.scss',
})
export class MainPageEvents {
  categories = CATEGORIES;
  activeCategory = signal('Todos');
  searchQuery = signal('');
  allEvents: EventData[] = EVENTS;

  filteredEvents = computed(() => {
    let events = this.allEvents;
    if (this.activeCategory() !== 'Todos') {
      events = events.filter(e => e.category === this.activeCategory());
    }
    if (this.searchQuery().trim()) {
      const q = this.searchQuery().toLowerCase();
      events = events.filter(e =>
        e.title.toLowerCase().includes(q) ||
        e.city.toLowerCase().includes(q) ||
        e.venue.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q)
      );
    }
    return events;
  });

  featuredEvent = computed(() => this.allEvents.find(e => e.isFeatured) ?? this.allEvents[0]);

  setCategory(cat: string) {
    this.activeCategory.set(cat);
    this.searchQuery.set('');
  }

  onSearch(e: Event) {
    this.searchQuery.set((e.target as HTMLInputElement).value);
  }

}
