import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TravelService {
  private readonly WARP_SPEEDS = {
    1: 1, // 1 pixel per second
    2: 2, // 2 pixels per second
    3: 4,
    4: 8,
    5: 16,
    6: 32,
    7: 64,
    8: 128,
    9: 256,
  };

  calculateTravelTime(
    start: { x: number; y: number },
    end: { x: number; y: number },
    warpSpeed: number
  ): number {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const speedInPixels =
      this.WARP_SPEEDS[warpSpeed as keyof typeof this.WARP_SPEEDS];

    return Math.ceil(distance / speedInPixels); // Returns time in seconds
  }

  calculateCurrentPosition(
    start: { x: number; y: number },
    end: { x: number; y: number },
    departureTime: number,
    speed: number
  ): { x: number; y: number } {
    const now = Date.now();
    const elapsedTime = (now - departureTime) / 1000; // Convert to seconds
    const totalTime = this.calculateTravelTime(start, end, speed);
    const progress = Math.min(elapsedTime / totalTime, 1);

    return {
      x: start.x + (end.x - start.x) * progress,
      y: start.y + (end.y - start.y) * progress,
    };
  }
}
