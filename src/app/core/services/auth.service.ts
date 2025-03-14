import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '@env/environment';
import { catchError, map } from 'rxjs/operators';
import { JwtService } from '@services/jwt.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/api/employees/authenticate`;

  constructor(private http: HttpClient, private jwtService: JwtService) { }

  login(email: string, password: string): Observable<boolean> {
    return this.http.post<{ jwt: string }>(this.apiUrl, { email, password }).pipe(
      map(response => {
        console.log('Login response:', response);
        if (response && response.jwt) {
          this.jwtService.setToken(response.jwt);
          return true;
        } else {
          return false;
        }
      }),
      catchError(error => {
        console.error('Login error', error);
        return of(false);
      })
    );
  }

  logout(): void {
    this.jwtService.removeToken();
  }

  isLoggedIn(): boolean {
    const token = this.jwtService.getToken();
    return token ? !this.jwtService.isTokenExpired(token) : false;
  }

  isAdmin(): boolean {
    const token = this.jwtService.getToken();
    if (token) {
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      return decodedToken.roles && decodedToken.roles.includes('ROLE_ADMIN');
    }
    return false;
  }
}