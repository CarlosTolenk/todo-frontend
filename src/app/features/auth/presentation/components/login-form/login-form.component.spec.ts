import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginFormComponent } from './login-form.component';

describe('LoginFormComponent', () => {
  let fixture: ComponentFixture<LoginFormComponent>;
  let component: LoginFormComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginFormComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('shows a validation message and does not emit when the email is invalid', () => {
    const submitSpy = vi.fn();
    component.submitted.subscribe(submitSpy);

    component.form.controls.email.setValue('correo-invalido');
    component.submit();
    fixture.detectChanges();

    expect(submitSpy).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Ingresa un correo válido');
  });

  it('returns the required message when the email is empty', () => {
    component.form.controls.email.setValue('');
    component.form.controls.email.markAsTouched();

    expect(component.emailErrorMessage).toBe('El email es obligatorio.');
  });

  it('normalizes the email before emitting it', () => {
    const submitSpy = vi.fn();
    component.submitted.subscribe(submitSpy);

    component.form.controls.email.setValue('  TEST@Example.COM  ');
    component.submit();

    expect(submitSpy).toHaveBeenCalledWith('test@example.com');
  });

  it('does not emit while loading', () => {
    const submitSpy = vi.fn();
    component.submitted.subscribe(submitSpy);
    component.loading = true;
    component.form.controls.email.setValue('test@example.com');

    component.submit();

    expect(submitSpy).not.toHaveBeenCalled();
  });
});
