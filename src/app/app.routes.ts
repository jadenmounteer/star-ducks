import { Routes } from '@angular/router';

import { HomeComponent } from './components/home/home.component';
import { GameLobbyComponent } from './components/game-lobby/game-lobby.component';

export const routes: Routes = [
  {
    path: 'home',
    component: HomeComponent,
  },
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'game-lobby/:gameSessionId',
    component: GameLobbyComponent,
  },
  {
    path: '**',
    component: HomeComponent,
  },
];
