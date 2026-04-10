import { Observable } from 'rxjs';

import { CreateTaskPayload, Task, UpdateTaskPayload } from '../entities/task.entity';

export abstract class TasksRepository {
  abstract getByUser(userId: string): Observable<Task[]>;
  abstract create(payload: CreateTaskPayload): Observable<Task>;
  abstract update(taskId: string, payload: UpdateTaskPayload): Observable<Task>;
  abstract delete(taskId: string): Observable<void>;
}
