import { Role } from './role';

export interface Officer {
  id: string;
  name: string;
  role: Role;
  // accessLevel: 'A' | 'B' | 'C';
}
