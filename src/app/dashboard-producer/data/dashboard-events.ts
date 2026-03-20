export type EventStatus = 'publicado' | 'borrador' | 'agotado' | 'finalizado';

export interface DashboardEvent {
  id: number;
  title: string;
  category: string;
  date: string;
  time: string;
  venue: string;
  city: string;
  price: number | null;
  gradient: string;
  status: EventStatus;
  ticketsSold: number;
  ticketsTotal: number;
  views: number;
  formDate: string; // YYYY-MM-DD for date input
}

export const GRADIENTS = [
  { label: 'Violeta / Azul',     value: 'linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)' },
  { label: 'Rosa / Violeta',     value: 'linear-gradient(135deg, #be185d 0%, #7c3aed 100%)' },
  { label: 'Naranja / Dorado',   value: 'linear-gradient(135deg, #b45309 0%, #d97706 100%)' },
  { label: 'Rojo / Borgoña',     value: 'linear-gradient(135deg, #7c2d12 0%, #dc2626 100%)' },
  { label: 'Verde / Esmeralda',  value: 'linear-gradient(135deg, #065f46 0%, #059669 100%)' },
  { label: 'Rosa Intenso',       value: 'linear-gradient(135deg, #831843 0%, #db2777 100%)' },
  { label: 'Azul / Índigo',      value: 'linear-gradient(135deg, #1e40af 0%, #7c3aed 100%)' },
  { label: 'Violeta / Pink',     value: 'linear-gradient(135deg, #4c1d95 0%, #ec4899 100%)' },
];

export const DASHBOARD_EVENTS: DashboardEvent[] = [
  {
    id: 1,
    title: 'Lollapalooza Argentina 2025',
    category: 'Música',
    date: '28 Mar',
    time: '12:00 hs',
    venue: 'Hipódromo de San Isidro',
    city: 'Buenos Aires',
    price: 75000,
    gradient: GRADIENTS[0].value,
    status: 'publicado',
    ticketsSold: 3200,
    ticketsTotal: 5000,
    views: 14800,
    formDate: '2025-03-28',
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
    gradient: GRADIENTS[1].value,
    status: 'publicado',
    ticketsSold: 1540,
    ticketsTotal: 2000,
    views: 8200,
    formDate: '2025-04-05',
  },
  {
    id: 3,
    title: 'Stand Up Night - Teatro Gran Rex',
    category: 'Stand Up',
    date: '12 Abr',
    time: '21:30 hs',
    venue: 'Teatro Gran Rex',
    city: 'Buenos Aires',
    price: 18000,
    gradient: GRADIENTS[2].value,
    status: 'borrador',
    ticketsSold: 0,
    ticketsTotal: 800,
    views: 420,
    formDate: '2025-04-12',
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
    gradient: GRADIENTS[3].value,
    status: 'publicado',
    ticketsSold: 980,
    ticketsTotal: 1200,
    views: 5600,
    formDate: '2025-04-19',
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
    gradient: GRADIENTS[4].value,
    status: 'agotado',
    ticketsSold: 4000,
    ticketsTotal: 4000,
    views: 32000,
    formDate: '2025-04-27',
  },
  {
    id: 6,
    title: 'Festival Internacional de Jazz',
    category: 'Música',
    date: '24 May',
    time: '19:00 hs',
    venue: 'Usina del Arte',
    city: 'Buenos Aires',
    price: null,
    gradient: GRADIENTS[6].value,
    status: 'borrador',
    ticketsSold: 0,
    ticketsTotal: 1500,
    views: 210,
    formDate: '2025-05-24',
  },
  {
    id: 7,
    title: 'Nicki Nicole - Gira Argentina',
    category: 'Música',
    date: '7 Jun',
    time: '21:00 hs',
    venue: 'Movistar Arena',
    city: 'Buenos Aires',
    price: 28000,
    gradient: GRADIENTS[7].value,
    status: 'publicado',
    ticketsSold: 870,
    ticketsTotal: 3000,
    views: 9400,
    formDate: '2025-06-07',
  },
  {
    id: 8,
    title: 'Feria del Vino - Mendoza',
    category: 'Gastronomía',
    date: '3 May',
    time: '11:00 hs',
    venue: 'Centro de Congresos',
    city: 'Mendoza',
    price: null,
    gradient: GRADIENTS[5].value,
    status: 'finalizado',
    ticketsSold: 2100,
    ticketsTotal: 2100,
    views: 11200,
    formDate: '2025-05-03',
  },
];
