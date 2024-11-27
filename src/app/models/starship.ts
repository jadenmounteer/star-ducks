import { User } from './user';

export interface Starship {
  id: string;
  name: string;
  officers: User[];
}
