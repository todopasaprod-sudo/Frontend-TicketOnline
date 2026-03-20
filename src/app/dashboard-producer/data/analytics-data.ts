export interface PeriodStat {
  ingresos: number;
  tickets: number;
  ocupacion: number;
  promedio: number;
  trend: { ingresos: number; tickets: number; ocupacion: number; promedio: number };
}

export const PERIODS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];

export const MONTHLY_REVENUE = [820000, 1100000, 950000, 1480000, 1245000, 680000];

export const PERIOD_DATA: PeriodStat[] = [
  { ingresos: 820000,  tickets: 412, ocupacion: 65, promedio: 1990, trend: { ingresos: -5,  tickets: -8,  ocupacion: -3, promedio: +2  } },
  { ingresos: 1100000, tickets: 580, ocupacion: 71, promedio: 1896, trend: { ingresos: +34, tickets: +41, ocupacion: +6, promedio: -5  } },
  { ingresos: 950000,  tickets: 510, ocupacion: 68, promedio: 1863, trend: { ingresos: -14, tickets: -12, ocupacion: -3, promedio: -2  } },
  { ingresos: 1480000, tickets: 847, ocupacion: 78, promedio: 1747, trend: { ingresos: +56, tickets: +66, ocupacion: +10,promedio: -6  } },
  { ingresos: 1245000, tickets: 720, ocupacion: 72, promedio: 1729, trend: { ingresos: -16, tickets: -15, ocupacion: -6, promedio: -1  } },
  { ingresos: 680000,  tickets: 380, ocupacion: 58, promedio: 1789, trend: { ingresos: -45, tickets: -47, ocupacion: -14,promedio: +3  } },
];

// ============================================================
// Ticket breakdown data
// ============================================================
export interface TicketType {
  name: string;
  price: number; // 0 = free
  capacity: number;
  sold: number;
  color: string;
}

export const TICKET_DATA: Record<number, TicketType[]> = {
  1: [ // Lollapalooza
    { name: 'Campo General',     price: 55000,  capacity: 3000, sold: 2180, color: '#21a9ff' },
    { name: 'Campo VIP',         price: 130000, capacity: 1500, sold: 820,  color: '#6366f1' },
    { name: 'Palco Corporativo', price: 380000, capacity: 500,  sold: 200,  color: '#f59e0b' },
  ],
  2: [ // Cosquín Rock
    { name: 'General', price: 35000,  capacity: 1200, sold: 1100, color: '#21a9ff' },
    { name: 'VIP',     price: 75000,  capacity: 500,  sold: 360,  color: '#6366f1' },
    { name: 'Gold',    price: 140000, capacity: 300,  sold: 80,   color: '#f59e0b' },
  ],
  3: [ // Stand Up Night
    { name: 'Platea', price: 18000, capacity: 800, sold: 0, color: '#21a9ff' },
  ],
  4: [ // El Rey León
    { name: 'Platea Alta', price: 15000, capacity: 600, sold: 580, color: '#21a9ff' },
    { name: 'Platea Baja', price: 28000, capacity: 400, sold: 320, color: '#6366f1' },
    { name: 'Palco',       price: 55000, capacity: 200, sold: 80,  color: '#10b981' },
  ],
  5: [ // River vs Boca
    { name: 'Platea Local',    price: 28000, capacity: 2000, sold: 2000, color: '#21a9ff' },
    { name: 'Platea Visitante',price: 28000, capacity: 1500, sold: 1500, color: '#6366f1' },
    { name: 'Palco Premium',   price: 85000, capacity: 500,  sold: 500,  color: '#f59e0b' },
  ],
  6: [ // Jazz Festival
    { name: 'General (Gratis)', price: 0, capacity: 1500, sold: 0, color: '#21a9ff' },
  ],
  7: [ // Nicki Nicole
    { name: 'General',  price: 22000,  capacity: 2000, sold: 620, color: '#21a9ff' },
    { name: 'VIP',      price: 55000,  capacity: 800,  sold: 200, color: '#6366f1' },
    { name: 'Platinum', price: 120000, capacity: 200,  sold: 50,  color: '#f59e0b' },
  ],
  8: [ // Feria del Vino
    { name: 'General (Gratis)', price: 0,     capacity: 1500, sold: 1500, color: '#21a9ff' },
    { name: 'Premium',          price: 15000, capacity: 600,  sold: 600,  color: '#6366f1' },
  ],
};

/** Datos del funnel por evento (views → clicks → checkouts → purchases) */
export const FUNNEL_DATA: Record<number, { views: number; clicks: number; checkouts: number; purchases: number }> = {
  1: { views: 14800, clicks: 8880,  checkouts: 4144, purchases: 3200 },
  2: { views: 8200,  clicks: 4100,  checkouts: 1845, purchases: 1540 },
  3: { views: 420,   clicks: 210,   checkouts: 84,   purchases: 0    },
  4: { views: 5600,  clicks: 2800,  checkouts: 1176, purchases: 980  },
  5: { views: 32000, clicks: 19200, checkouts: 4800, purchases: 4000 },
  6: { views: 210,   clicks: 105,   checkouts: 0,    purchases: 0    },
  7: { views: 9400,  clicks: 4700,  checkouts: 1034, purchases: 870  },
  8: { views: 11200, clicks: 6720,  checkouts: 2352, purchases: 2100 },
};
