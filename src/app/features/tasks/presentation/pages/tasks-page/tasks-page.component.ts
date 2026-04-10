import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { BehaviorSubject, combineLatest, finalize, firstValueFrom, map } from 'rxjs';

import { AuthFacade } from '../../../../auth/application/facades/auth.facade';
import { ConfirmDialogComponent } from '../../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { PageStateComponent } from '../../../../../shared/components/page-state/page-state.component';
import { TasksFacade } from '../../../application/facades/tasks.facade';
import { CreateTaskPayload, Task, UpdateTaskPayload } from '../../../domain/entities/task.entity';
import { TaskEditDialogComponent } from '../../components/task-edit-dialog/task-edit-dialog.component';
import { TaskFormComponent, TaskFormValue } from '../../components/task-form/task-form.component';
import { TasksListComponent } from '../../components/tasks-list/tasks-list.component';

@Component({
  selector: 'app-tasks-page',
  standalone: true,
  imports: [
    AsyncPipe,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatIconModule,
    MatSnackBarModule,
    PageStateComponent,
    TaskFormComponent,
    TasksListComponent,
  ],
  templateUrl: './tasks-page.component.html',
  styleUrl: './tasks-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TasksPageComponent implements OnInit {
  @ViewChild(TaskFormComponent) private createTaskForm?: TaskFormComponent;

  readonly tasks$ = new BehaviorSubject<Task[]>([]);
  readonly loading$ = new BehaviorSubject<boolean>(true);
  readonly creating$ = new BehaviorSubject<boolean>(false);
  readonly errorMessage$ = new BehaviorSubject<string | null>(null);
  readonly pendingTaskIds$ = new BehaviorSubject<string[]>([]);

  readonly vm$ = combineLatest([
    this.authFacade.currentUser$,
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
    private readonly authFacade: AuthFacade,
    private readonly tasksFacade: TasksFacade,
    private readonly dialog: MatDialog,
    private readonly snackBar: MatSnackBar,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    const currentUser = this.authFacade.getCurrentUser();

    if (!currentUser) {
      void this.router.navigate(['/login']);
      return;
    }

    this.loadTasks(currentUser.id);
  }

  createTask(formValue: TaskFormValue): void {
    const user = this.authFacade.getCurrentUser();
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

    this.tasksFacade
      .create(payload)
      .pipe(finalize(() => this.creating$.next(false)))
      .subscribe({
        next: (task) => {
          this.tasks$.next(this.tasksFacade.sortTasks([...this.tasks$.value, task]));
          this.createTaskForm?.reset();
          this.showSuccessMessage('Tarea creada correctamente.');
        },
        error: (error: Error) => {
          this.errorMessage$.next(error.message);
        },
      });
  }

  updateTask(task: Task, payload: UpdateTaskPayload): void {
    this.setTaskPending(task.id, true);
    this.errorMessage$.next(null);

    this.tasksFacade
      .update(task.id, payload)
      .pipe(finalize(() => this.setTaskPending(task.id, false)))
      .subscribe({
        next: (updatedTask) => {
          this.tasks$.next(
            this.tasksFacade.sortTasks(
              this.tasks$.value.map((currentTask) => (currentTask.id === updatedTask.id ? updatedTask : currentTask)),
            ),
          );
          this.showSuccessMessage('Tarea actualizada correctamente.');
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

    this.tasksFacade
      .delete(task.id)
      .pipe(finalize(() => this.setTaskPending(task.id, false)))
      .subscribe({
        next: () => {
          this.tasks$.next(this.tasks$.value.filter((currentTask) => currentTask.id !== task.id));
          this.showSuccessMessage('Tarea eliminada correctamente.');
        },
        error: (error: Error) => {
          this.errorMessage$.next(error.message);
        },
      });
  }

  async logout(): Promise<void> {
    const confirmed = await this.confirmLogout();

    if (!confirmed) {
      return;
    }

    this.authFacade.logout();
    void this.router.navigate(['/login']);
  }

  retry(): void {
    const user = this.authFacade.getCurrentUser();
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

    this.tasksFacade
      .loadByUser(userId)
      .pipe(finalize(() => this.loading$.next(false)))
      .subscribe({
        next: (tasks) => {
          this.tasks$.next(tasks);
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

  private async confirmRemoval(taskTitle: string): Promise<boolean> {
    const result = await firstValueFrom(
      this.dialog
        .open(ConfirmDialogComponent, {
          width: '28rem',
          data: {
            eyebrow: 'Acción permanente',
            title: 'Eliminar tarea',
            message: `¿Quieres eliminar "${taskTitle}"? Esta acción no se puede deshacer.`,
            confirmLabel: 'Eliminar',
            icon: 'delete',
          },
        })
        .afterClosed(),
    );

    return Boolean(result);
  }

  private async confirmLogout(): Promise<boolean> {
    const result = await firstValueFrom(
      this.dialog
        .open(ConfirmDialogComponent, {
          width: '28rem',
          data: {
            eyebrow: 'Sesión activa',
            title: 'Cerrar sesión',
            message: '¿Quieres cerrar la sesión actual?',
            confirmLabel: 'Cerrar sesión',
            cancelLabel: 'Cancelar',
            icon: 'logout',
          },
        })
        .afterClosed(),
    );

    return Boolean(result);
  }

  private showSuccessMessage(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
    });
  }
}
