import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

import { TasksRepository } from '../../domain/repositories/tasks.repository';
import { CreateTaskPayload, Task, UpdateTaskPayload } from '../../domain/entities/task.entity';

@Injectable({
  providedIn: 'root',
})
export class TasksFacade {
  constructor(private readonly tasksRepository: TasksRepository) {}

  loadByUser(userId: string): Observable<Task[]> {
    return this.tasksRepository.getByUser(userId).pipe(map((tasks) => this.sortTasks(tasks)));
  }

  create(payload: CreateTaskPayload): Observable<Task> {
    return this.tasksRepository.create(payload);
  }

  update(taskId: string, payload: UpdateTaskPayload): Observable<Task> {
    return this.tasksRepository.update(taskId, payload);
  }

  delete(taskId: string): Observable<void> {
    return this.tasksRepository.delete(taskId);
  }

  sortTasks(tasks: Task[]): Task[] {
    return [...tasks].sort(
      (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
    );
  }
}
