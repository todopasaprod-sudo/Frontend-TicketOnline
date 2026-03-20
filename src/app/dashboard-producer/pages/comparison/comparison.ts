import { Component, signal, computed } from '@angular/core';
import { PERIODS, PERIOD_DATA } from '../../data/analytics-data';

interface KpiDef {
  label: string;
  key: keyof typeof PERIOD_DATA[0];
  format: (v: number) => string;
  icon: string;
  iconBg: string;
  iconColor: string;
}

@Component({
  selector: 'app-comparison',
  imports: [],
  templateUrl: './comparison.html',
  styleUrl: './comparison.scss',
})
export class Comparison {
  periods = PERIODS;
  periodData = PERIOD_DATA;

  periodA = signal(3); // Abril (best month)
  periodB = signal(4); // Mayo

  statsA = computed(() => this.periodData[this.periodA()]);
  statsB = computed(() => this.periodData[this.periodB()]);

  kpiDefs: KpiDef[] = [
    {
      label: 'Ingresos',
      key: 'ingresos',
      format: v => '$' + v.toLocaleString('es-AR'),
      icon: 'money',
      iconBg: 'rgba(16,185,129,0.15)',
      iconColor: '#34d399',
    },
    {
      label: 'Tickets vendidos',
      key: 'tickets',
      format: v => v.toLocaleString('es-AR'),
      icon: 'ticket',
      iconBg: 'rgba(59,130,246,0.15)',
      iconColor: '#60a5fa',
    },
    {
      label: 'Tasa de ocupación',
      key: 'ocupacion',
      format: v => v + '%',
      icon: 'percent',
      iconBg: 'rgba(168,85,247,0.15)',
      iconColor: '#c084fc',
    },
    {
      label: 'Ticket promedio',
      key: 'promedio',
      format: v => '$' + v.toLocaleString('es-AR'),
      icon: 'tag',
      iconBg: 'rgba(249,115,22,0.15)',
      iconColor: '#fb923c',
    },
  ];

  kpiComparisons = computed(() => {
    const a = this.statsA();
    const b = this.statsB();
    return this.kpiDefs.map(def => {
      const key = def.key as 'ingresos' | 'tickets' | 'ocupacion' | 'promedio';
      const va = a[key] as number;
      const vb = b[key] as number;
      const delta = va > 0 ? Math.round(((vb - va) / va) * 100) : 0;
      const maxVal = Math.max(va, vb, 1);
      return {
        ...def,
        valueA: def.format(va),
        valueB: def.format(vb),
        rawA: va,
        rawB: vb,
        delta,
        barA: Math.round((va / maxVal) * 100),
        barB: Math.round((vb / maxVal) * 100),
      };
    });
  });

  selectA(i: number) {
    if (i !== this.periodB()) this.periodA.set(i);
  }

  selectB(i: number) {
    if (i !== this.periodA()) this.periodB.set(i);
  }
}
