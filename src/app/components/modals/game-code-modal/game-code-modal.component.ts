import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ModalService } from '../../../services/modal-service/modal-service';

export interface entranceCodeModalResult {
  entranceCode: string | undefined;
}

@Component({
  selector: 'app-game-code-modal',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './game-code-modal.component.html',
  styleUrl: './game-code-modal.component.scss',
})
export class entranceCodeModalComponent {
  entranceCode: string = '';

  constructor(private modalService: ModalService) {}

  public submit() {
    this.modalService.close({ entranceCode: this.entranceCode });
  }
}
