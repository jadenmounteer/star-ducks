export class Star {
  constructor(
    public x: number,
    public y: number,
    public size: number,
    public brightness: number,
    public speed: number,
    public twinkleSpeed: number = Math.random() * 0.05
  ) {}

  update(width: number, height: number) {
    // Only update the twinkling effect
    this.brightness += this.twinkleSpeed;
    if (this.brightness > 1 || this.brightness < 0.2) {
      this.twinkleSpeed = -this.twinkleSpeed;
    }
  }

  draw(ctx: CanvasRenderingContext2D, drawX: number, drawY: number) {
    ctx.beginPath();
    ctx.arc(drawX, drawY, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${this.brightness})`;
    ctx.fill();
  }
}
