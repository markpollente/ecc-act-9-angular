// filepath: src/app/services/role.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { RoleDto } from '../models/role.dto';
import { Page } from '../models/page';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private apiUrl = `${environment.apiUrl}/api/roles`;

  constructor(private http: HttpClient) { }

  createRole(role: RoleDto): Observable<RoleDto> {
    return this.http.post<RoleDto>(this.apiUrl, role);
  }

  getRoleById(id: number): Observable<RoleDto> {
    return this.http.get<RoleDto>(`${this.apiUrl}/${id}`);
  }

  getAllRoles(page: number, size: number): Observable<Page<RoleDto>> {
    return this.http.get<Page<RoleDto>>(`${this.apiUrl}?page=${page}&size=${size}`);
  }

  updateRole(id: number, role: RoleDto): Observable<RoleDto> {
    return this.http.put<RoleDto>(`${this.apiUrl}/${id}`, role);
  }

  deleteRole(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}