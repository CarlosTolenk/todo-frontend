import { BehaviorSubject, of, throwError } from 'rxjs';

import { AuthFacade } from '../../../../auth/application/facades/auth.facade';
import { User } from '../../../../auth/domain/entities/user.entity';
import { TasksFacade } from '../../../application/facades/tasks.facade';
import { Task } from '../../../domain/entities/task.entity';
import { TasksPageComponent } from './tasks-page.component';

describe('TasksPageComponent', () => {
  let component: TasksPageComponent;
  let currentUser: User | null;
  let currentUser$: BehaviorSubject<User | null>;
  let authFacade: {
    currentUser$: BehaviorSubject<User | null>;
    getCurrentUser: ReturnType<typeof vi.fn>;
    logout: ReturnType<typeof vi.fn>;
  };
  let tasksFacade: {
    loadByUser: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
    sortTasks: ReturnType<typeof vi.fn>;
  };
  let dialog: {
    open: ReturnType<typeof vi.fn>;
  };
  let router: {
    navigate: ReturnType<typeof vi.fn>;
  };

  const user: User = {
    id: 'user-1',
    email: 'test@example.com',
    createdAt: '2026-04-10T00:00:00.000Z',
  };

  const olderTask: Task = {
    id: 'task-1',
    userId: user.id,
    title: 'Older task',
    description: 'desc',
    completed: false,
    createdAt: '2026-04-09T10:00:00.000Z',
    updatedAt: '2026-04-09T10:00:00.000Z',
  };

  const newerTask: Task = {
    id: 'task-2',
    userId: user.id,
    title: 'Newer task',
    description: 'desc',
    completed: true,
    createdAt: '2026-04-10T10:00:00.000Z',
    updatedAt: '2026-04-10T10:00:00.000Z',
  };

  beforeEach(() => {
    currentUser = user;
    currentUser$ = new BehaviorSubject<User | null>(currentUser);

    authFacade = {
      currentUser$,
      getCurrentUser: vi.fn(() => currentUser),
      logout: vi.fn(),
    };
    tasksFacade = {
      loadByUser: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      sortTasks: vi.fn((tasks: Task[]) =>
        [...tasks].sort(
          (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
        ),
      ),
    };
    dialog = {
      open: vi.fn(),
    };
    router = {
      navigate: vi.fn().mockResolvedValue(true),
    };

    component = new TasksPageComponent(authFacade as never, tasksFacade as never, dialog as never, router as never);
  });

  it('redirects to login on init when there is no active session', () => {
    currentUser = null;
    currentUser$.next(null);
    tasksFacade.loadByUser.mockReturnValue(of([]));

    component.ngOnInit();

    expect(router.navigate).toHaveBeenCalledWith(['/login']);
    expect(tasksFacade.loadByUser).not.toHaveBeenCalled();
  });

  it('loads tasks for the active user on init', () => {
    tasksFacade.loadByUser.mockReturnValue(of([newerTask, olderTask]));

    component.ngOnInit();

    expect(tasksFacade.loadByUser).toHaveBeenCalledWith(user.id);
    expect(component.tasks$.value).toEqual([newerTask, olderTask]);
    expect(component.loading$.value).toBe(false);
  });

  it('creates a task and appends it using the facade sort order', () => {
    tasksFacade.create.mockReturnValue(of(newerTask));
    component.tasks$.next([olderTask]);

    component.createTask({ title: 'Newer task', description: 'desc' });

    expect(tasksFacade.create).toHaveBeenCalledWith({
      userId: user.id,
      title: 'Newer task',
      description: 'desc',
    });
    expect(component.tasks$.value).toEqual([newerTask, olderTask]);
    expect(component.creating$.value).toBe(false);
  });

  it('does nothing when creating a task without an active user', () => {
    currentUser = null;
    currentUser$.next(null);

    component.createTask({ title: 'Task', description: 'desc' });

    expect(tasksFacade.create).not.toHaveBeenCalled();
  });

  it('stores an error when creating a task fails', () => {
    tasksFacade.create.mockReturnValue(throwError(() => new Error('Create failed')));

    component.createTask({ title: 'Task', description: 'desc' });

    expect(component.errorMessage$.value).toBe('Create failed');
    expect(component.creating$.value).toBe(false);
  });

  it('updates a task and clears the pending flag afterwards', () => {
    const updatedTask = { ...olderTask, title: 'Updated title', updatedAt: '2026-04-11T10:00:00.000Z' };
    component.tasks$.next([olderTask]);
    tasksFacade.update.mockReturnValue(of(updatedTask));

    component.updateTask(olderTask, { title: 'Updated title' });

    expect(tasksFacade.update).toHaveBeenCalledWith(olderTask.id, { title: 'Updated title' });
    expect(component.tasks$.value).toEqual([updatedTask]);
    expect(component.pendingTaskIds$.value).toEqual([]);
  });

  it('keeps the error message when updating a task fails', () => {
    component.tasks$.next([olderTask]);
    tasksFacade.update.mockReturnValue(throwError(() => new Error('Update failed')));

    component.updateTask(olderTask, { completed: true });

    expect(component.errorMessage$.value).toBe('Update failed');
    expect(component.pendingTaskIds$.value).toEqual([]);
  });

  it('does not delete when removal is cancelled', async () => {
    component.tasks$.next([olderTask]);
    dialog.open.mockReturnValue({
      afterClosed: () => of(false),
    });

    await component.removeTask(olderTask);

    expect(tasksFacade.delete).not.toHaveBeenCalled();
    expect(component.tasks$.value).toEqual([olderTask]);
  });

  it('removes the task after a confirmed deletion', async () => {
    component.tasks$.next([olderTask, newerTask]);
    tasksFacade.delete.mockReturnValue(of(void 0));
    dialog.open.mockReturnValue({
      afterClosed: () => of(true),
    });

    await component.removeTask(olderTask);

    expect(tasksFacade.delete).toHaveBeenCalledWith(olderTask.id);
    expect(component.tasks$.value).toEqual([newerTask]);
    expect(component.pendingTaskIds$.value).toEqual([]);
  });

  it('keeps the error message when deleting a task fails', async () => {
    component.tasks$.next([olderTask]);
    tasksFacade.delete.mockReturnValue(throwError(() => new Error('Delete failed')));
    dialog.open.mockReturnValue({
      afterClosed: () => of(true),
    });

    await component.removeTask(olderTask);

    expect(component.errorMessage$.value).toBe('Delete failed');
    expect(component.pendingTaskIds$.value).toEqual([]);
  });

  it('logs out and redirects to login', () => {
    component.logout();

    expect(authFacade.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('retries loading tasks for the active user', () => {
    tasksFacade.loadByUser.mockReturnValue(of([olderTask]));

    component.retry();

    expect(tasksFacade.loadByUser).toHaveBeenCalledWith(user.id);
  });

  it('opens the edit dialog and delegates the resulting payload to updateTask', async () => {
    dialog.open.mockReturnValue({
      afterClosed: () =>
        of({
          title: 'Edited title',
          description: 'Edited description',
        }),
    });

    const updateTaskSpy = vi.spyOn(component, 'updateTask').mockImplementation(() => undefined);
    await component.editTask(olderTask);

    expect(dialog.open).toHaveBeenCalled();
    expect(updateTaskSpy).toHaveBeenCalledWith(olderTask, {
      title: 'Edited title',
      description: 'Edited description',
    });
  });

  it('does not update when the edit dialog closes without data', async () => {
    dialog.open.mockReturnValue({
      afterClosed: () => of(undefined),
    });

    const updateTaskSpy = vi.spyOn(component, 'updateTask');
    await component.editTask(olderTask);

    expect(updateTaskSpy).not.toHaveBeenCalled();
  });

  it('shows the load error and stops the loading state when fetching tasks fails', () => {
    tasksFacade.loadByUser.mockReturnValue(throwError(() => new Error('Load failed')));

    component.ngOnInit();

    expect(component.errorMessage$.value).toBe('Load failed');
    expect(component.loading$.value).toBe(false);
  });
});
