import { HttpClient, HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiErrorResponse, ApiResponse } from '../http/api-response.models';

type RequestOptions = object | undefined;
type ErrorMatcher = (value: string) => boolean;

interface ApiErrorRule {
  readonly matches: (errorCode: string, errorMessage: string) => boolean;
  readonly userMessage: string;
}

const USER_ERROR_MESSAGES = {
  invalidData: 'Los datos enviados no son válidos. Revisa el formulario e inténtalo de nuevo.',
  notFound: 'No encontramos la información solicitada.',
  conflict: 'Ese registro ya existe.',
  forbidden: 'No tienes permisos para realizar esta acción.',
  network: 'No pudimos conectar con el servidor. Verifica tu conexión e inténtalo de nuevo.',
  server: 'El servidor tuvo un problema al procesar tu solicitud. Inténtalo otra vez en unos minutos.',
  unexpectedRequest: 'Ocurrió un error inesperado al procesar la solicitud.',
  unexpectedConnection: 'Ocurrió un error inesperado al conectar con la API.',
} as const;

const API_ERROR_PATTERNS = {
  invalidData: ['invalid', 'validation', 'invalid request data'],
  notFound: ['not_found', 'not found'],
  conflict: ['already_exists', 'conflict'],
  forbidden: ['unauthorized', 'forbidden'],
} as const;

const includesAny =
  (patterns: readonly string[]): ErrorMatcher =>
  (value: string): boolean =>
    patterns.some((pattern) => value.includes(pattern));

const API_ERROR_RULES: readonly ApiErrorRule[] = [
  {
    matches: (code, message) =>
      includesAny(API_ERROR_PATTERNS.invalidData)(code) || includesAny(API_ERROR_PATTERNS.invalidData)(message),
    userMessage: USER_ERROR_MESSAGES.invalidData,
  },
  {
    matches: (code) => includesAny(API_ERROR_PATTERNS.notFound)(code),
    userMessage: USER_ERROR_MESSAGES.notFound,
  },
  {
    matches: (code) => includesAny(API_ERROR_PATTERNS.conflict)(code),
    userMessage: USER_ERROR_MESSAGES.conflict,
  },
  {
    matches: (code) => includesAny(API_ERROR_PATTERNS.forbidden)(code),
    userMessage: USER_ERROR_MESSAGES.forbidden,
  },
];

const HTTP_STATUS_MESSAGES: Partial<Record<HttpStatusCode, string>> = {
  [HttpStatusCode.BadRequest]: USER_ERROR_MESSAGES.invalidData,
  [HttpStatusCode.NotFound]: USER_ERROR_MESSAGES.notFound,
  [HttpStatusCode.Conflict]: 'La operación entró en conflicto con un registro existente.',
};

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly baseUrl = environment.baseUrl;

  constructor(private readonly http: HttpClient) {}

  get<T>(path: string, options?: RequestOptions): Observable<T> {
    return this.request<T>('GET', path, undefined, options);
  }

  post<T>(path: string, body: unknown): Observable<T> {
    return this.request<T>('POST', path, body);
  }

  patch<T>(path: string, body: unknown): Observable<T> {
    return this.request<T>('PATCH', path, body);
  }

  delete<T>(path: string): Observable<T> {
    return this.request<T>('DELETE', path);
  }

  private request<T>(
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
    path: string,
    body?: unknown,
    options?: RequestOptions,
  ): Observable<T> {
    const url = this.buildUrl(path);

    return this.http
      .request<ApiResponse<T>>(method, url, {
        body,
        ...(options ?? {}),
      })
      .pipe(map((response) => this.unwrapResponse(response)), catchError((error) => this.handleError(error)));
  }

  private buildUrl(path: string): string {
    return `${this.baseUrl}${path}`;
  }

  private unwrapResponse<T>(response: ApiResponse<T>): T {
    if (response.success) {
      return response.data;
    }

    throw new Error(this.mapApiErrorMessage(response.error?.code, response.error?.message));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    const apiError = error.error as ApiErrorResponse | undefined;
    const message =
      apiError && apiError.success === false && apiError.error
        ? this.mapApiErrorMessage(apiError.error.code, apiError.error.message)
        : this.mapHttpErrorMessage(error);

    return throwError(() => new Error(message));
  }

  private mapApiErrorMessage(code: string | undefined, message: string | undefined): string {
    const normalizedCode = code?.toLowerCase() ?? '';
    const normalizedMessage = message?.toLowerCase() ?? '';
    const matchedRule = API_ERROR_RULES.find((rule) => rule.matches(normalizedCode, normalizedMessage));

    if (matchedRule) {
      return matchedRule.userMessage;
    }

    return message?.trim() || USER_ERROR_MESSAGES.unexpectedRequest;
  }

  private mapHttpErrorMessage(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return USER_ERROR_MESSAGES.network;
    }

    const statusMessage = HTTP_STATUS_MESSAGES[error.status as HttpStatusCode];

    if (statusMessage) {
      return statusMessage;
    }

    if (error.status >= HttpStatusCode.InternalServerError) {
      return USER_ERROR_MESSAGES.server;
    }

    return error.message || USER_ERROR_MESSAGES.unexpectedConnection;
  }
}
