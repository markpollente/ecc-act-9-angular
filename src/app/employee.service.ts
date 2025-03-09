import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { EmployeeDto } from '../models/employee.dto';
import { Page } from '../models/page';
import { HelpdeskTicketDto } from '../models/helpdesk-ticket.dto';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private apiUrl = `${environment.apiUrl}/api/employees`;

  constructor(private http: HttpClient) { }

  getProfile(): Observable<EmployeeDto> {
    return this.http.get<EmployeeDto>(`${this.apiUrl}/profile`);
  }

  getAllEmployees(page: number, size: number): Observable<Page<EmployeeDto>> {
    return this.http.get<Page<EmployeeDto>>(`${this.apiUrl}?page=${page}&size=${size}`);
  }

  getAllEmployeesWithFilters(filters: any): Observable<Page<EmployeeDto>> {
    let params = new HttpParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params = params.set(key, filters[key]);
      }
    });
    return this.http.get<Page<EmployeeDto>>(this.apiUrl, { params });
  }

  getEmployeeById(id: number): Observable<EmployeeDto> {
    return this.http.get<EmployeeDto>(`${this.apiUrl}/${id}`);
  }

  createEmployee(employee: EmployeeDto): Observable<EmployeeDto> {
    return this.http.post<EmployeeDto>(this.apiUrl, employee);
  }

  updateEmployee(id: number, employee: EmployeeDto): Observable<EmployeeDto> {
    return this.http.put<EmployeeDto>(`${this.apiUrl}/${id}`, employee);
  }

  deleteEmployee(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { responseType: 'text' as 'json' });
  }

  assignRoleToEmployee(employeeId: number, roleId: number): Observable<EmployeeDto> {
    return this.http.put<EmployeeDto>(`${this.apiUrl}/${employeeId}/assign-role/${roleId}`, {});
  }

  getFiledTickets(): Observable<HelpdeskTicketDto[]> {
    return this.http.get<HelpdeskTicketDto[]>(`${this.apiUrl}/profile/filed`);
  }

  getAssignedTickets(): Observable<HelpdeskTicketDto[]> {
    return this.http.get<HelpdeskTicketDto[]>(`${this.apiUrl}/profile/assigned`);
  }
}