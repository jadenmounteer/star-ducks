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
    // Update star position
    // This gives a cool effect, but not what we're going for. Maybe something like this
    // for warp speed main view effect?
    // this.y += this.speed;

    // Reset position if star goes off screen
    if (this.y > height) {
      this.y = 0;
      this.x = Math.random() * width;
    }

    // Update twinkling effect
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
