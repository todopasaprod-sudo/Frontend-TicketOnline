import { CanActivateFn } from '@angular/router';

export const producerGuard: CanActivateFn = () => {
  // TODO: inject AuthService y verificar rol productor
  // Ejemplo: return inject(AuthService).hasRole('producer');
  return true;
};
