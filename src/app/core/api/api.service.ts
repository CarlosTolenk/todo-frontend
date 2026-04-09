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

    throw new Error(response.error.message);
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    const apiError = error.error as ApiErrorResponse | undefined;
    const message =
      apiError && !apiError.success
        ? apiError.error.message
        : error.message || 'Ocurrió un error inesperado al conectar con la API.';

    return throwError(() => new Error(message));
  }
}
