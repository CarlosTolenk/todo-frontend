import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export interface TaskFormValue {
  title: string;
  description: string;
}

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './task-form.component.html',
  styleUrl: './task-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskFormComponent {
  @Input() loading = false;
  @Input() submitLabel = 'Guardar';
  @Input() set initialValue(value: TaskFormValue | null) {
    if (!value) {
      this.form.reset({ title: '', description: '' });
      return;
    }

    this.form.reset(value);
  }
  @Output() readonly submitted = new EventEmitter<TaskFormValue>();

  readonly form = this.formBuilder.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(120)]],
    description: ['', [Validators.maxLength(500)]],
  });

  constructor(private readonly formBuilder: FormBuilder) {}

  submit(): void {
    if (this.form.invalid || this.loading) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitted.emit({
      title: this.form.controls.title.value.trim(),
      description: this.form.controls.description.value.trim(),
    });
  }
}
