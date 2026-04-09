import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiErrorResponse, ApiResponse } from '../models/api.models';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly baseUrl = environment.baseUrl;

  constructor(private readonly http: HttpClient) {}

  get<T>(path: string, options?: object): Observable<T> {
    return this.http
      .get<ApiResponse<T>>(this.buildUrl(path), options)
      .pipe(map((response) => this.unwrapResponse(response)), catchError((error) => this.handleError(error)));
  }

  post<T>(path: string, body: unknown): Observable<T> {
    return this.http
      .post<ApiResponse<T>>(this.buildUrl(path), body)
      .pipe(map((response) => this.unwrapResponse(response)), catchError((error) => this.handleError(error)));
  }

  patch<T>(path: string, body: unknown): Observable<T> {
    return this.http
      .patch<ApiResponse<T>>(this.buildUrl(path), body)
      .pipe(map((response) => this.unwrapResponse(response)), catchError((error) => this.handleError(error)));
  }

  delete<T>(path: string): Observable<T> {
    return this.http
      .delete<ApiResponse<T>>(this.buildUrl(path))
      .pipe(map((response) => this.unwrapResponse(response)), catchError((error) => this.handleError(error)));
  }

  private buildUrl(path: string): string {
    return `${this.baseUrl}${path}`;
  }

  private unwrapResponse<T>(response: ApiResponse<T>): T {
    if (response.success) {
      return response.data;
    }

    throw new Error(this.mapApiErrorMessage(response.error.code, response.error.message));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    const apiError = error.error as ApiErrorResponse | undefined;
    const message =
      apiError && !apiError.success
        ? this.mapApiErrorMessage(apiError.error.code, apiError.error.message)
        : this.mapHttpErrorMessage(error);

    return throwError(() => new Error(message));
  }

  private mapApiErrorMessage(code: string | undefined, message: string | undefined): string {
    const normalizedCode = code?.toLowerCase() ?? '';
    const normalizedMessage = message?.toLowerCase() ?? '';

    if (
      normalizedCode.includes('invalid') ||
      normalizedCode.includes('validation') ||
      normalizedMessage.includes('invalid request data') ||
      normalizedMessage.includes('validation')
    ) {
      return 'Los datos enviados no son válidos. Revisa el formulario e inténtalo de nuevo.';
    }

    if (normalizedCode.includes('not_found') || normalizedCode.includes('not found')) {
      return 'No encontramos la información solicitada.';
    }

    if (normalizedCode.includes('already_exists') || normalizedCode.includes('conflict')) {
      return 'Ese registro ya existe.';
    }

    if (normalizedCode.includes('unauthorized') || normalizedCode.includes('forbidden')) {
      return 'No tienes permisos para realizar esta acción.';
    }

    return message?.trim() || 'Ocurrió un error inesperado al procesar la solicitud.';
  }

  private mapHttpErrorMessage(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return 'No pudimos conectar con el servidor. Verifica tu conexión e inténtalo de nuevo.';
    }

    if (error.status === 400) {
      return 'Los datos enviados no son válidos. Revisa el formulario e inténtalo de nuevo.';
    }

    if (error.status === 404) {
      return 'No encontramos la información solicitada.';
    }

    if (error.status === 409) {
      return 'La operación entró en conflicto con un registro existente.';
    }

    if (error.status >= 500) {
      return 'El servidor tuvo un problema al procesar tu solicitud. Inténtalo otra vez en unos minutos.';
    }

    return error.message || 'Ocurrió un error inesperado al conectar con la API.';
  }
}
