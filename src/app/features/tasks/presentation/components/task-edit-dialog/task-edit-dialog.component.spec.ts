import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { Task } from '../../../domain/entities/task.entity';
import { TaskEditDialogComponent } from './task-edit-dialog.component';

describe('TaskEditDialogComponent', () => {
  const task: Task = {
    id: 'task-1',
    userId: 'user-1',
    title: 'Write tests',
    description: 'Cover the dialog logic',
    completed: false,
    createdAt: '2026-04-10T00:00:00.000Z',
    updatedAt: '2026-04-10T00:00:00.000Z',
  };

  it('derives the initial form value from the injected task and closes with the submitted payload', async () => {
    const close = vi.fn();

    await TestBed.configureTestingModule({
      imports: [TaskEditDialogComponent],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            task,
            loading: false,
          },
        },
        {
          provide: MatDialogRef,
          useValue: { close },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(TaskEditDialogComponent);
    const component = fixture.componentInstance;

    expect(component.initialValue).toEqual({
      title: task.title,
      description: task.description,
    });

    component.save({ title: 'Edited', description: 'Updated desc' });

    expect(close).toHaveBeenCalledWith({ title: 'Edited', description: 'Updated desc' });
  });
});
