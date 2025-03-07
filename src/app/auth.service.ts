import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../environments/environment';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/api/employees/authenticate`;

  constructor(private http: HttpClient) { }

  login(email: string, password: string): Observable<boolean> {
    return this.http.post<{ token: string }>(this.apiUrl, { email, password }).pipe(
      map(response => {
        localStorage.setItem('token', response.token);
        return true;
      }),
      catchError(error => {
        console.error('Login error', error);
        return of(false);
      })
    );
  }
}