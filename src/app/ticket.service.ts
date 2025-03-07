import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { HelpdeskTicketDto } from '../models/helpdesk-ticket.dto';
import { Page } from '../models/page';

@Injectable({
  providedIn: 'root'
})
export class HelpdeskTicketService {
  private apiUrl = `${environment.apiUrl}/api/tickets`;

  constructor(private http: HttpClient) { }

  createTicket(ticket: HelpdeskTicketDto): Observable<HelpdeskTicketDto> {
    return this.http.post<HelpdeskTicketDto>(this.apiUrl, ticket);
  }

  getTicketById(id: number): Observable<HelpdeskTicketDto> {
    return this.http.get<HelpdeskTicketDto>(`${this.apiUrl}/${id}`);
  }

  getAllTickets(page: number, size: number): Observable<Page<HelpdeskTicketDto>> {
    return this.http.get<Page<HelpdeskTicketDto>>(`${this.apiUrl}?page=${page}&size=${size}`);
  }

  getTicketsByStatus(status: string): Observable<HelpdeskTicketDto[]> {
    return this.http.get<HelpdeskTicketDto[]>(`${this.apiUrl}/status/${status}`);
  }

  getTicketsByAssignee(assigneeId: number): Observable<HelpdeskTicketDto[]> {
    return this.http.get<HelpdeskTicketDto[]>(`${this.apiUrl}/assignee/${assigneeId}`);
  }

  updateTicket(id: number, ticket: HelpdeskTicketDto): Observable<HelpdeskTicketDto> {
    return this.http.put<HelpdeskTicketDto>(`${this.apiUrl}/${id}`, ticket);
  }

  deleteTicket(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  assignTicketToEmployee(ticketId: number, employeeId: number): Observable<HelpdeskTicketDto> {
    return this.http.put<HelpdeskTicketDto>(`${this.apiUrl}/${ticketId}/assign/${employeeId}`, {});
  }

  addRemarkAndUpdateStatus(ticketId: number, remarks: string, status: string): Observable<HelpdeskTicketDto> {
    return this.http.put<HelpdeskTicketDto>(`${this.apiUrl}/${ticketId}/remark`, { remarks, status });
  }
}