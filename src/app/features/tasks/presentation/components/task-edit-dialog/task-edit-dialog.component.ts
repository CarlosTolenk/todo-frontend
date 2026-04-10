import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

import { Task } from '../../../domain/entities/task.entity';
import { TaskFormComponent, TaskFormValue } from '../task-form/task-form.component';

export interface TaskEditDialogData {
  task: Task;
  loading: boolean;
}

@Component({
  selector: 'app-task-edit-dialog',
  standalone: true,
  imports: [
    MatButtonModule,
    MatDialogActions,
    MatDialogClose,
    MatDialogContent,
    MatDialogTitle,
    TaskFormComponent,
  ],
  templateUrl: './task-edit-dialog.component.html',
  styleUrl: './task-edit-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskEditDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) readonly data: TaskEditDialogData,
    private readonly dialogRef: MatDialogRef<TaskEditDialogComponent, TaskFormValue>,
  ) {}

  get initialValue(): TaskFormValue {
    return {
      title: this.data.task.title,
      description: this.data.task.description,
    };
  }

  save(formValue: TaskFormValue): void {
    this.dialogRef.close(formValue);
  }
}
