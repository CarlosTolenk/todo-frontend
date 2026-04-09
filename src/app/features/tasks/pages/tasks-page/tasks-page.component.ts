import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { BehaviorSubject, combineLatest, finalize, firstValueFrom, map } from 'rxjs';

import { AuthService } from '../../../../core/services/auth.service';
import { TasksApiService } from '../../../../core/services/tasks-api.service';
import { CreateTaskPayload, Task, UpdateTaskPayload, User } from '../../../../core/models/api.models';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { PageStateComponent } from '../../../../shared/components/page-state/page-state.component';
import { TaskEditDialogComponent } from '../../components/task-edit-dialog/task-edit-dialog.component';
import { TaskFormComponent, TaskFormValue } from '../../components/task-form/task-form.component';
import { TasksListComponent } from '../../components/tasks-list/tasks-list.component';

interface TasksViewModel {
  user: User | null;
  tasks: Task[];
  loading: boolean;
  creating: boolean;
  errorMessage: string | null;
  pendingTaskIds: string[];
}

@Component({
  selector: 'app-tasks-page',
  standalone: true,
  imports: [
    AsyncPipe,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatIconModule,
    PageStateComponent,
    TaskFormComponent,
    TasksListComponent,
  ],
  templateUrl: './tasks-page.component.html',
  styleUrl: './tasks-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TasksPageComponent implements OnInit {
  readonly tasks$ = new BehaviorSubject<Task[]>([]);
  readonly loading$ = new BehaviorSubject<boolean>(true);
  readonly creating$ = new BehaviorSubject<boolean>(false);
  readonly errorMessage$ = new BehaviorSubject<string | null>(null);
  readonly pendingTaskIds$ = new BehaviorSubject<string[]>([]);

  readonly vm$ = combineLatest([
    this.authService.currentUser$,
    this.tasks$,
    this.loading$,
    this.creating$,
    this.errorMessage$,
    this.pendingTaskIds$,
  ]).pipe(
    map(([user, tasks, loading, creating, errorMessage, pendingTaskIds]) => ({
      user,
      tasks,
      loading,
      creating,
      errorMessage,
      pendingTaskIds,
    })),
  );

  constructor(
    private readonly authService: AuthService,
    private readonly tasksApiService: TasksApiService,
    private readonly dialog: MatDialog,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();

    if (!currentUser) {
      void this.router.navigate(['/login']);
      return;
    }

    this.loadTasks(currentUser.id);
  }

  createTask(formValue: TaskFormValue): void {
    const user = this.authService.getCurrentUser();
    if (!user) {
      return;
    }

    const payload: CreateTaskPayload = {
      userId: user.id,
      title: formValue.title,
      description: formValue.description,
    };

    this.creating$.next(true);
    this.errorMessage$.next(null);

    this.tasksApiService
      .create(payload)
      .pipe(finalize(() => this.creating$.next(false)))
      .subscribe({
        next: (task) => {
          this.tasks$.next(this.sortTasks([...this.tasks$.value, task]));
        },
        error: (error: Error) => {
          this.errorMessage$.next(error.message);
        },
      });
  }

  updateTask(task: Task, payload: UpdateTaskPayload): void {
    this.setTaskPending(task.id, true);
    this.errorMessage$.next(null);

    this.tasksApiService
      .update(task.id, payload)
      .pipe(finalize(() => this.setTaskPending(task.id, false)))
      .subscribe({
        next: (updatedTask) => {
          this.tasks$.next(
            this.sortTasks(this.tasks$.value.map((currentTask) => (currentTask.id === updatedTask.id ? updatedTask : currentTask))),
          );
        },
        error: (error: Error) => {
          this.errorMessage$.next(error.message);
        },
      });
  }

  async removeTask(task: Task): Promise<void> {
    const confirmed = await this.confirmRemoval(task.title);

    if (!confirmed) {
      return;
    }

    this.setTaskPending(task.id, true);
    this.errorMessage$.next(null);

    this.tasksApiService
      .delete(task.id)
      .pipe(finalize(() => this.setTaskPending(task.id, false)))
      .subscribe({
        next: () => {
          this.tasks$.next(this.tasks$.value.filter((currentTask) => currentTask.id !== task.id));
        },
        error: (error: Error) => {
          this.errorMessage$.next(error.message);
        },
      });
  }

  logout(): void {
    this.authService.logout();
    void this.router.navigate(['/login']);
  }

  retry(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.loadTasks(user.id);
    }
  }

  async editTask(task: Task): Promise<void> {
    const result = await firstValueFrom(
      this.dialog
        .open(TaskEditDialogComponent, {
          width: '40rem',
          data: {
            task,
            loading: false,
          },
        })
        .afterClosed(),
    );

    if (!result) {
      return;
    }

    this.updateTask(task, result);
  }

  private loadTasks(userId: string): void {
    this.loading$.next(true);
    this.errorMessage$.next(null);

    this.tasksApiService
      .getByUser(userId)
      .pipe(finalize(() => this.loading$.next(false)))
      .subscribe({
        next: (tasks) => {
          this.tasks$.next(this.sortTasks(tasks));
        },
        error: (error: Error) => {
          this.errorMessage$.next(error.message);
        },
      });
  }

  private setTaskPending(taskId: string, isPending: boolean): void {
    const pendingIds = new Set(this.pendingTaskIds$.value);

    if (isPending) {
      pendingIds.add(taskId);
    } else {
      pendingIds.delete(taskId);
    }

    this.pendingTaskIds$.next(Array.from(pendingIds));
  }

  private sortTasks(tasks: Task[]): Task[] {
    return [...tasks].sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
  }

  private async confirmRemoval(taskTitle: string): Promise<boolean> {
    const result = await firstValueFrom(
      this.dialog
        .open(ConfirmDialogComponent, {
          width: '28rem',
          data: {
            title: 'Eliminar tarea',
            message: `¿Quieres eliminar "${taskTitle}"? Esta acción no se puede deshacer.`,
            confirmLabel: 'Eliminar',
          },
        })
        .afterClosed(),
    );

    return Boolean(result);
  }
}
