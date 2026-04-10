import { MatCheckboxChange } from '@angular/material/checkbox';

import { Task } from '../../../domain/entities/task.entity';
import { TaskItemComponent } from './task-item.component';

describe('TaskItemComponent', () => {
  const task: Task = {
    id: 'task-1',
    userId: 'user-1',
    title: 'Write tests',
    description: '',
    completed: false,
    createdAt: '2026-04-10T00:00:00.000Z',
    updatedAt: '2026-04-10T00:00:00.000Z',
  };

  it('emits the checkbox state when toggled', () => {
    const component = new TaskItemComponent();
    const emitSpy = vi.spyOn(component.toggleCompleted, 'emit');

    component.task = task;
    component.onToggle({ checked: true } as MatCheckboxChange);

    expect(emitSpy).toHaveBeenCalledWith(true);
  });
});
