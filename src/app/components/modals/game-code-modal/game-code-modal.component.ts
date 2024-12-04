import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ModalService } from '../../../services/modal-service/modal-service';

export interface GameCodeModalResult {
  gameCode: string | undefined;
}

@Component({
  selector: 'app-game-code-modal',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './game-code-modal.component.html',
  styleUrl: './game-code-modal.component.scss',
})
export class GameCodeModalComponent {
  gameCode: string = '';

  constructor(private modalService: ModalService) {}

  public submit() {
    this.modalService.close({ gameCode: this.gameCode });
  }
}
