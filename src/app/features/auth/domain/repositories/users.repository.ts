import { Observable } from 'rxjs';

import { CreateUserPayload, User } from '../entities/user.entity';

export abstract class UsersRepository {
  abstract findByEmail(email: string): Observable<User | null>;
  abstract create(payload: CreateUserPayload): Observable<User>;
}
