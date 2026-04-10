import { Task } from '../../../domain/entities/task.entity';
import { TasksListComponent } from './tasks-list.component';

describe('TasksListComponent', () => {
  const task: Task = {
    id: 'task-1',
    userId: 'user-1',
    title: 'Write tests',
    description: '',
    completed: false,
    createdAt: '2026-04-10T00:00:00.000Z',
    updatedAt: '2026-04-10T00:00:00.000Z',
  };

  it('tracks rows by task id', () => {
    const component = new TasksListComponent();

    expect(component.trackByTaskId(0, task)).toBe(task.id);
  });

  it('detects when a task is pending', () => {
    const component = new TasksListComponent();
    component.pendingTaskIds = ['task-1'];

    expect(component.isPending('task-1')).toBe(true);
    expect(component.isPending('task-2')).toBe(false);
  });
});
