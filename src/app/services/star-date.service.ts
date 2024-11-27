import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class StarDateService {
  public getCurrentStarDate(): string {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);

    // Calculate stardate
    const stardate = ((dayOfYear / 365) * 100).toFixed(2);

    return `${stardate}`;
  }
}
