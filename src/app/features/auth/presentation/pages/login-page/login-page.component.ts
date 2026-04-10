import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { BehaviorSubject, finalize, firstValueFrom } from 'rxjs';

import { AuthFacade } from '../../../application/facades/auth.facade';
import { User } from '../../../domain/entities/user.entity';
import { LoginFormComponent } from '../../components/login-form/login-form.component';
import { ConfirmDialogComponent } from '../../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [AsyncPipe, MatDialogModule, LoginFormComponent],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPageComponent implements OnInit {
  readonly loading$ = new BehaviorSubject<boolean>(false);
  readonly errorMessage$ = new BehaviorSubject<string | null>(null);

  constructor(
    private readonly authFacade: AuthFacade,
    private readonly dialog: MatDialog,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    if (this.authFacade.getCurrentUser()) {
      void this.router.navigate(['/tasks']);
    }
  }

  async onSubmit(email: string): Promise<void> {
    this.errorMessage$.next(null);
    this.loading$.next(true);

    try {
      const existingUser = await firstValueFrom(this.authFacade.findUserByEmail(email));

      if (existingUser) {
        this.completeLogin(existingUser);
        return;
      }

      const shouldCreate = await firstValueFrom(
        this.dialog
          .open(ConfirmDialogComponent, {
            width: '28rem',
            autoFocus: false,
            data: {
              eyebrow: 'Usuario no encontrado',
              title: 'Crear usuario',
              message: `No encontramos un usuario para ${email}. ¿Quieres crearlo ahora?`,
              confirmLabel: 'Crear usuario',
              cancelLabel: 'Volver',
              icon: 'person_search',
            },
          })
          .afterClosed(),
      );

      if (shouldCreate !== true) {
        return;
      }

      const createdUser = await firstValueFrom(
        this.authFacade.createUser(email).pipe(finalize(() => this.loading$.next(false))),
      );

      this.completeLogin(createdUser);
    } catch (error) {
      this.loading$.next(false);
      this.errorMessage$.next(error instanceof Error ? error.message : 'No pudimos iniciar sesión.');
    } finally {
      if (this.loading$.value) {
        this.loading$.next(false);
      }
    }
  }

  private completeLogin(user: User): void {
    this.authFacade.persistSession(user);
    void this.router.navigate(['/tasks']);
  }
}
