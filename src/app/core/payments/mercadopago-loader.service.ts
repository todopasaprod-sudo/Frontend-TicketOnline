import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class MercadoPagoLoaderService {
  private loaded = false;
  private loadPromise: Promise<void> | null = null;

  load(): Promise<void> {
    if (this.loaded) return Promise.resolve();
    if (this.loadPromise) return this.loadPromise;

    this.loadPromise = new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://sdk.mercadopago.com/js/v2';
      script.onload = () => {
        this.loaded = true;
        resolve();
      };
      script.onerror = () => reject(new Error('Failed to load MercadoPago SDK'));
      document.head.appendChild(script);
    });

    return this.loadPromise;
  }
}
