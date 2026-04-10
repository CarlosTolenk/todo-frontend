import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { Task } from '../../../domain/entities/task.entity';
import { TaskItemComponent } from '../task-item/task-item.component';

@Component({
  selector: 'app-tasks-list',
  standalone: true,
  imports: [TaskItemComponent],
  templateUrl: './tasks-list.component.html',
  styleUrl: './tasks-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TasksListComponent {
  @Input({ required: true }) tasks: Task[] = [];
  @Input() pendingTaskIds: string[] = [];
  @Output() readonly toggleCompleted = new EventEmitter<{ task: Task; completed: boolean }>();
  @Output() readonly edit = new EventEmitter<Task>();
  @Output() readonly remove = new EventEmitter<Task>();

  trackByTaskId(_: number, task: Task): string {
    return task.id;
  }

  isPending(taskId: string): boolean {
    return this.pendingTaskIds.includes(taskId);
  }
}
