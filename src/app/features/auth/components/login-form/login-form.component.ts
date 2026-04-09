import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './login-form.component.html',
  styleUrl: './login-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginFormComponent {
  private readonly emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  @Input() loading = false;
  @Input() errorMessage: string | null = null;
  @Output() readonly submitted = new EventEmitter<string>();

  readonly form = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.pattern(this.emailPattern)]],
  });

  constructor(private readonly formBuilder: FormBuilder) {}

  get emailErrorMessage(): string | null {
    const emailControl = this.form.controls.email;

    if (emailControl.hasError('required')) {
      return 'El email es obligatorio.';
    }

    if (emailControl.hasError('pattern')) {
      return 'Ingresa un correo válido, por ejemplo nombre@dominio.com.';
    }

    return null;
  }

  submit(): void {
    if (this.form.invalid || this.loading) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitted.emit(this.form.controls.email.value.trim().toLowerCase());
  }
}
