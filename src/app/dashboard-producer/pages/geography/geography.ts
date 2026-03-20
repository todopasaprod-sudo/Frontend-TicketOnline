import { Component, signal, computed } from '@angular/core';
import { DASHBOARD_EVENTS } from '../../data/dashboard-events';

// ── Map constants ────────────────────────────────────────────────────────────
// Simplified Argentina outline — viewBox="0 0 220 400"
export const ARGENTINA_PATH =
  'M 74,4 L 145,4 L 162,18 L 168,38 L 172,62 L 175,90 L 178,114 ' +
  'L 180,133 L 182,153 L 180,172 L 178,192 L 170,214 L 155,238 ' +
  'L 140,260 L 126,280 L 112,300 L 96,320 L 78,340 L 62,358 ' +
  'L 50,370 L 44,378 L 38,372 L 40,356 L 47,340 L 53,322 ' +
  'L 56,302 L 56,282 L 49,264 L 38,246 L 27,228 L 17,210 ' +
  'L 11,190 L 10,170 L 10,150 L 12,130 L 16,110 L 22,88 ' +
  'L 28,66 L 36,46 L 46,26 L 59,10 Z';

// [x, y] in SVG coordinate space (viewBox 220x400)
const CITY_COORDS: Record<string, [number, number]> = {
  'Buenos Aires': [166, 154],
  'Córdoba':      [102, 116],
  'Rosario':      [141, 133],
  'Mendoza':      [52,  134],
  'La Plata':     [170, 160],
  'Mar del Plata':[175, 195],
  'Tucumán':      [91,  60 ],
  'Salta':        [89,  36 ],
  'Neuquén':      [59,  205],
  'Resistencia':  [143, 68 ],
};

const CITY_COLORS = [
  '#a855f7', '#6366f1', '#10b981',
  '#f59e0b', '#ec4899', '#3b82f6',
  '#f97316', '#14b8a6', '#8b5cf6', '#06b6d4',
];

// Tickets per city per event (0 = all events aggregated)
const GEO_DATA: Record<number, Record<string, number>> = {
  0: { // All events — aggregated
    'Buenos Aires':  8428,
    'Córdoba':       1527,
    'Rosario':       987,
    'Mendoza':       531,
    'La Plata':      566,
    'Mar del Plata': 217,
    'Tucumán':       126,
    'Salta':         89,
    'Neuquén':       103,
    'Resistencia':   45,
  },
  1: { // Lollapalooza — BA event
    'Buenos Aires':  2240,
    'La Plata':      384,
    'Rosario':       256,
    'Córdoba':       160,
    'Mendoza':       64,
    'Mar del Plata': 48,
    'Tucumán':       32,
    'Salta':         16,
  },
  2: { // Cosquín Rock — Córdoba
    'Córdoba':       924,
    'Buenos Aires':  308,
    'Rosario':       154,
    'Tucumán':       77,
    'Mendoza':       46,
    'Salta':         31,
  },
  4: { // El Rey León — BA Teatro Colón
    'Buenos Aires':  686,
    'La Plata':      147,
    'Mar del Plata': 49,
    'Rosario':       49,
    'Córdoba':       33,
    'Mendoza':       16,
  },
  5: { // River vs Boca — sold out
    'Buenos Aires':  2800,
    'La Plata':      400,
    'Rosario':       320,
    'Córdoba':       240,
    'Mar del Plata': 120,
    'Mendoza':       80,
    'Neuquén':       40,
  },
  7: { // Nicki Nicole — BA
    'Buenos Aires':  522,
    'Córdoba':       174,
    'Rosario':       104,
    'La Plata':      35,
    'Tucumán':       17,
    'Mendoza':       17,
  },
  8: { // Feria del Vino — Mendoza
    'Mendoza':       1260,
    'Buenos Aires':  420,
    'Córdoba':       210,
    'Rosario':       105,
    'Neuquén':       63,
    'Salta':         42,
  },
};

export interface CityRow {
  city: string;
  tickets: number;
  pct: number;
  radius: number;
  x: number;
  y: number;
  color: string;
}

@Component({
  selector: 'app-geography',
  imports: [],
  templateUrl: './geography.html',
  styleUrl: './geography.scss',
})
export class Geography {
  readonly argentinaPath = ARGENTINA_PATH;

  // All events + per-event selector. 0 = todos los eventos
  eventOptions = [
    { id: 0, title: 'Todos los eventos', gradient: 'linear-gradient(135deg,#a855f7,#6366f1)' },
    ...DASHBOARD_EVENTS.filter(e => GEO_DATA[e.id]),
  ];

  selectedId = signal(0);

  rawCities = computed((): CityRow[] => {
    const data = GEO_DATA[this.selectedId()] ?? {};
    const total = Object.values(data).reduce((s, v) => s + v, 0);
    const maxTickets = Math.max(...Object.values(data), 1);

    return Object.entries(data)
      .sort((a, b) => b[1] - a[1])
      .map(([city, tickets], i) => {
        const coords = CITY_COORDS[city] ?? [110, 200];
        return {
          city,
          tickets,
          pct: total > 0 ? Math.round((tickets / total) * 100) : 0,
          radius: 4 + Math.round((tickets / maxTickets) * 18),
          x: coords[0],
          y: coords[1],
          color: CITY_COLORS[i % CITY_COLORS.length],
        };
      });
  });

  // KPIs
  totalBuyers = computed(() =>
    this.rawCities().reduce((s, c) => s + c.tickets, 0)
  );

  topCity = computed(() => this.rawCities()[0] ?? null);

  cityCount = computed(() => this.rawCities().length);

  concentrationIdx = computed(() => this.topCity()?.pct ?? 0);

  selectEvent(id: number) { this.selectedId.set(id); }

  formatNum(n: number): string {
    return n.toLocaleString('es-AR');
  }

  selectedOption = computed(() =>
    this.eventOptions.find(e => e.id === this.selectedId())!
  );
}
