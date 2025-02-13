import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TimeFormatService {
  public formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    let timeString = '';

    if (hours > 0) {
      timeString += `${hours}h `;
    }
    if (minutes > 0 || hours > 0) {
      timeString += `${minutes}m `;
    }
    timeString += `${remainingSeconds}s`;

    return timeString;
  }
}
