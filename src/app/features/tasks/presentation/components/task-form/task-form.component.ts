import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroupDirective, ReactiveFormsModule, Validators } from '@angular/forms';
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
  @ViewChild(FormGroupDirective) private formDirective?: FormGroupDirective;

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
    description: ['', [Validators.required, Validators.maxLength(500)]],
  });

  constructor(private readonly formBuilder: FormBuilder) {}

  reset(): void {
    const emptyValue = { title: '', description: '' };

    this.formDirective?.resetForm(emptyValue);
    this.form.reset(emptyValue);
  }

  submit(): void {
    const title = this.form.controls.title.value.trim();
    const description = this.form.controls.description.value.trim();

    this.form.controls.title.setValue(title);
    this.form.controls.description.setValue(description);

    if (this.form.invalid || this.loading) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitted.emit({
      title,
      description,
    });
  }
}
