import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiService } from './api.service';

describe('ApiService', () => {
  let service: ApiService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ApiService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(ApiService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('unwraps successful responses', async () => {
    const requestPromise = firstValueFrom(service.get<{ id: string }>('/users'));
    const request = httpTestingController.expectOne(`${environment.baseUrl}/users`);

    expect(request.request.method).toBe('GET');
    request.flush({
      success: true,
      data: { id: 'user-1' },
    });

    await expect(requestPromise).resolves.toEqual({ id: 'user-1' });
  });

  it('maps API semantic errors to user messages', async () => {
    const requestPromise = firstValueFrom(service.post('/users', { email: 'test@example.com' }));
    const request = httpTestingController.expectOne(`${environment.baseUrl}/users`);

    request.flush({
      success: false,
      error: {
        code: 'already_exists',
        message: 'User already exists',
      },
    });

    await expect(requestPromise).rejects.toThrow('Ese registro ya existe.');
  });

  it('uses the HTTP status mapping when the server returns a transport error', async () => {
    const requestPromise = firstValueFrom(service.delete('/tasks/task-1'));
    const request = httpTestingController.expectOne(`${environment.baseUrl}/tasks/task-1`);

    request.flush('Not found', {
      status: 404,
      statusText: 'Not Found',
    });

    await expect(requestPromise).rejects.toThrow('No encontramos la información solicitada.');
  });

  it('returns the network error message for status 0 failures', async () => {
    const requestPromise = firstValueFrom(service.patch('/tasks/task-1', { completed: true }));
    const request = httpTestingController.expectOne(`${environment.baseUrl}/tasks/task-1`);

    request.error(new ProgressEvent('error'), {
      status: 0,
      statusText: 'Unknown Error',
    });

    await expect(requestPromise).rejects.toThrow(
      'No pudimos conectar con el servidor. Verifica tu conexión e inténtalo de nuevo.',
    );
  });

  it('falls back to the original HTTP error message when no rule matches', async () => {
    const requestPromise = firstValueFrom(service.get('/tasks'));
    const request = httpTestingController.expectOne(`${environment.baseUrl}/tasks`);

    request.flush('teapot', {
      status: 418,
      statusText: "I'm a teapot",
    });

    await expect(requestPromise).rejects.toSatisfy(
      (error: unknown) =>
        error instanceof Error &&
        error.message === `Http failure response for ${environment.baseUrl}/tasks: 418 I'm a teapot`,
    );
  });

  it('maps HTTP server failures to the generic server message', async () => {
    const requestPromise = firstValueFrom(service.get('/tasks'));
    const request = httpTestingController.expectOne(`${environment.baseUrl}/tasks`);

    request.flush('server-error', {
      status: 500,
      statusText: 'Server Error',
    });

    await expect(requestPromise).rejects.toThrow(
      'El servidor tuvo un problema al procesar tu solicitud. Inténtalo otra vez en unos minutos.',
    );
  });
});
