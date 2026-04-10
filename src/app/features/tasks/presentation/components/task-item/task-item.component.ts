import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';

import { Task } from '../../../domain/entities/task.entity';

@Component({
  selector: 'app-task-item',
  standalone: true,
  imports: [DatePipe, MatButtonModule, MatCardModule, MatCheckboxModule, MatIconModule],
  templateUrl: './task-item.component.html',
  styleUrl: './task-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskItemComponent {
  @Input({ required: true }) task!: Task;
  @Input() disabled = false;
  @Output() readonly toggleCompleted = new EventEmitter<boolean>();
  @Output() readonly edit = new EventEmitter<void>();
  @Output() readonly remove = new EventEmitter<void>();

  onToggle(change: MatCheckboxChange): void {
    this.toggleCompleted.emit(change.checked);
  }
}
