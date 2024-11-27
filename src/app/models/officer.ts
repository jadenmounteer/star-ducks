import { Role } from './role';
import { User } from './user';

export interface Officer {
  userDetails: User;
  starshipId: string;
  role: Role;
}
