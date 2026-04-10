import { Observable } from 'rxjs';

import { User } from '../entities/user.entity';

export abstract class UserSessionRepository {
  abstract readonly currentUser$: Observable<User | null>;
  abstract getCurrentUser(): User | null;
  abstract save(user: User): void;
  abstract clear(): void;
}
