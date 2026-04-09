import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '../api/api.service';
import { CreateTaskPayload, Task, UpdateTaskPayload } from '../models/api.models';

@Injectable({
  providedIn: 'root',
})
export class TasksApiService {
  constructor(private readonly apiService: ApiService) {}

  getByUser(userId: string): Observable<Task[]> {
    return this.apiService.get<Task[]>(`/tasks?userId=${encodeURIComponent(userId)}`);
  }

  create(payload: CreateTaskPayload): Observable<Task> {
    return this.apiService.post<Task>('/tasks', payload);
  }

  update(taskId: string, payload: UpdateTaskPayload): Observable<Task> {
    return this.apiService.patch<Task>(`/tasks/${taskId}`, payload);
  }

  delete(taskId: string): Observable<void> {
    return this.apiService.delete<void>(`/tasks/${taskId}`);
  }
}
