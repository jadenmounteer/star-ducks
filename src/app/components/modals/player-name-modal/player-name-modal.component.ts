import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ModalService } from '../../../services/modal-service/modal-service';

export interface PlayerNameModalResult {
  playerName: string | undefined;
}

@Component({
  selector: 'app-player-name-modal',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './player-name-modal.component.html',
  styleUrl: './player-name-modal.component.scss',
})
export class PlayerNameModalComponent {
  playerName: string = '';

  constructor(private modalService: ModalService) {}

  public submit() {
    this.modalService.close({ playerName: this.playerName });
  }
}
