import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

import { ConfirmDialogComponent } from './confirm-dialog.component';

describe('ConfirmDialogComponent', () => {
  it('exposes the injected dialog data', async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmDialogComponent],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            title: 'Eliminar tarea',
            message: 'Esta acción no se puede deshacer.',
            confirmLabel: 'Eliminar',
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(ConfirmDialogComponent);
    const component = fixture.componentInstance;

    expect(component.data.title).toBe('Eliminar tarea');
    expect(component.data.confirmLabel).toBe('Eliminar');
  });
});
