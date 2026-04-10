import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';

import { Task } from '../../domain/entities/task.entity';
import { TasksRepository } from '../../domain/repositories/tasks.repository';
import { TasksFacade } from './tasks.facade';

describe('TasksFacade', () => {
  let facade: TasksFacade;
  let tasksRepository: {
    getByUser: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };

  const olderTask: Task = {
    id: 'task-1',
    userId: 'user-1',
    title: 'Older',
    description: '',
    completed: false,
    createdAt: '2026-04-09T10:00:00.000Z',
    updatedAt: '2026-04-09T10:00:00.000Z',
  };

  const newerTask: Task = {
    id: 'task-2',
    userId: 'user-1',
    title: 'Newer',
    description: '',
    completed: true,
    createdAt: '2026-04-10T10:00:00.000Z',
    updatedAt: '2026-04-10T10:00:00.000Z',
  };

  beforeEach(() => {
    tasksRepository = {
      getByUser: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [TasksFacade, { provide: TasksRepository, useValue: tasksRepository }],
    });

    facade = TestBed.inject(TasksFacade);
  });

  it('loads tasks sorted by creation date descending', async () => {
    tasksRepository.getByUser.mockReturnValue(of([olderTask, newerTask]));

    await expect(firstValueFrom(facade.loadByUser('user-1'))).resolves.toEqual([newerTask, olderTask]);
    expect(tasksRepository.getByUser).toHaveBeenCalledWith('user-1');
  });

  it('delegates create, update and delete to the repository', async () => {
    tasksRepository.create.mockReturnValue(of(newerTask));
    tasksRepository.update.mockReturnValue(of({ ...newerTask, title: 'Updated' }));
    tasksRepository.delete.mockReturnValue(of(void 0));

    await expect(
      firstValueFrom(facade.create({ userId: 'user-1', title: 'Task', description: 'Desc' })),
    ).resolves.toEqual(newerTask);
    await expect(
      firstValueFrom(facade.update('task-2', { completed: false, title: 'Updated' })),
    ).resolves.toEqual({ ...newerTask, title: 'Updated' });
    await expect(firstValueFrom(facade.delete('task-2'))).resolves.toBeUndefined();

    expect(tasksRepository.create).toHaveBeenCalledWith({
      userId: 'user-1',
      title: 'Task',
      description: 'Desc',
    });
    expect(tasksRepository.update).toHaveBeenCalledWith('task-2', { completed: false, title: 'Updated' });
    expect(tasksRepository.delete).toHaveBeenCalledWith('task-2');
  });

  it('sorts tasks without mutating the original array', () => {
    const tasks = [olderTask, newerTask];

    const sortedTasks = facade.sortTasks(tasks);

    expect(sortedTasks).toEqual([newerTask, olderTask]);
    expect(tasks).toEqual([olderTask, newerTask]);
  });
});
