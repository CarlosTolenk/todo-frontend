import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskFormComponent } from './task-form.component';

describe('TaskFormComponent', () => {
  let fixture: ComponentFixture<TaskFormComponent>;
  let component: TaskFormComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskFormComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads the initial value into the form and resets when null is provided', () => {
    component.initialValue = {
      title: 'Comprar pan',
      description: 'Antes de las 6 PM',
    };

    expect(component.form.getRawValue()).toEqual({
      title: 'Comprar pan',
      description: 'Antes de las 6 PM',
    });

    component.initialValue = null;

    expect(component.form.getRawValue()).toEqual({
      title: '',
      description: '',
    });
  });

  it('blocks invalid submissions when required fields are missing', () => {
    const submitSpy = vi.fn();
    component.submitted.subscribe(submitSpy);

    component.submit();

    expect(submitSpy).not.toHaveBeenCalled();
    expect(component.form.controls.title.hasError('required')).toBe(true);
    expect(component.form.controls.description.hasError('required')).toBe(true);
    expect(component.form.controls.title.touched).toBe(true);
    expect(component.form.controls.description.touched).toBe(true);
  });

  it('shows the required description message in the template', () => {
    component.form.controls.title.setValue('Preparar demo');
    component.form.controls.description.setValue('');

    component.submit();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('La descripción es obligatoria.');
  });

  it('emits a trimmed payload when the form is valid', () => {
    const submitSpy = vi.fn();
    component.submitted.subscribe(submitSpy);

    component.form.setValue({
      title: '  Preparar demo  ',
      description: '  Revisar los casos felices  ',
    });

    component.submit();

    expect(submitSpy).toHaveBeenCalledWith({
      title: 'Preparar demo',
      description: 'Revisar los casos felices',
    });
  });

  it('resets the form back to the empty state', () => {
    component.form.setValue({
      title: 'Task',
      description: 'Desc',
    });

    component.reset();

    expect(component.form.getRawValue()).toEqual({
      title: '',
      description: '',
    });
  });
});
