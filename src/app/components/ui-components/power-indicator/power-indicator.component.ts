import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-power-indicator',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="power-indicator">
      <div class="power-tube">
        <div
          class="power-level"
          [style.height]="powerLevel + '%'"
          [class.critical]="powerLevel < 20"
          [class.warning]="powerLevel >= 20 && powerLevel < 40"
        ></div>
        <div class="power-markers">
          @for(marker of markers; track marker) {
          <div class="marker" [style.bottom]="marker + '%'">
            <span class="marker-label">{{ marker }}%</span>
          </div>
          }
        </div>
      </div>
      <div class="power-readout">
        <span class="power-label"> Remaining Power</span>
        <span class="power-value">{{ powerLevel }}%</span>
        <span class="power-status">{{
          powerLevel < 20 ? 'CRITICAL' : 'NOMINAL'
        }}</span>
      </div>
    </div>
  `,
  styles: [
    `
      .power-indicator {
        display: flex;
        gap: 20px;
        padding: 20px;
        height: 100%;
        align-items: center;
      }

      .power-tube {
        width: 40px;
        height: 300px;
        background: rgba(0, 0, 0, 0.3);
        border: 1px solid #0f0;
        border-radius: 4px;
        position: relative;
        overflow: hidden;
      }

      .power-level {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        background: #0f0;
        box-shadow: 0 0 10px #0f0;
        transition: height 0.5s ease;

        &.critical {
          background: #f00;
          box-shadow: 0 0 10px #f00;
        }

        &.warning {
          background: #ff0;
          box-shadow: 0 0 10px #ff0;
        }
      }

      .power-markers {
        position: absolute;
        width: 100%;
        height: 100%;

        .marker {
          position: absolute;
          width: 100%;
          height: 1px;
          background: rgba(0, 255, 0, 0.3);

          .marker-label {
            position: absolute;
            right: calc(100% + 5px);
            transform: translateY(-50%);
            font-family: 'JetBrains Mono', monospace;
            font-size: 12px;
            color: #0f0;
          }
        }
      }

      .power-readout {
        display: flex;
        flex-direction: column;
        gap: 5px;
        font-family: 'JetBrains Mono', monospace;

        .power-label {
          color: #0f0;
          font-size: 14px;
          opacity: 0.7;
        }

        .power-value {
          color: #0f0;
          font-size: 24px;
          font-weight: bold;
        }

        .power-status {
          color: #0f0;
          font-size: 12px;

          &.critical {
            color: #f00;
            animation: blink 1s infinite;
          }
        }
      }

      @keyframes blink {
        0%,
        100% {
          opacity: 1;
        }
        50% {
          opacity: 0;
        }
      }
    `,
  ],
})
export class PowerIndicatorComponent {
  @Input() powerLevel: number = 100;
  markers = [0, 25, 50, 75, 100];
}
