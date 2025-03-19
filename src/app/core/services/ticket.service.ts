import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '@env/environment';

import { Ticket } from '@models/ticket.model';
import { Page } from '@models/page';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private apiUrl = `${environment.apiUrl}/api/tickets`;

  constructor(private http: HttpClient) { }

  createTicket(ticket: Ticket): Observable<Ticket> {
    return this.http.post<Ticket>(this.apiUrl, ticket);
  }

  getTicketById(id: number): Observable<Ticket> {
    return this.http.get<Ticket>(`${this.apiUrl}/${id}`);
  }

  getAllTickets(page: number, size: number): Observable<Page<Ticket>> {
    return this.http.get<Page<Ticket>>(`${this.apiUrl}?page=${page}&size=${size}`);
  }

  getAllTicketsWithFilters(filters: any): Observable<Page<Ticket>> {
    let params = new HttpParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params = params.set(key, filters[key]);
      }
    })
    return this.http.get<Page<Ticket>>(this.apiUrl, { params });
  }

  getTicketsByStatus(status: string): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(`${this.apiUrl}/status/${status}`);
  }

  getTicketsByAssignee(assigneeId: number): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(`${this.apiUrl}/assignee/${assigneeId}`);
  }

  updateTicket(id: number, ticket: Ticket): Observable<Ticket> {
    return this.http.put<Ticket>(`${this.apiUrl}/${id}`, ticket);
  }

  deleteTicket(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { responseType: 'text' });
  }

  assignTicketToEmployee(ticketId: number, employeeId: number): Observable<Ticket> {
    return this.http.put<Ticket>(`${this.apiUrl}/${ticketId}/assign/${employeeId}`, {});
  }

  addRemarkAndUpdateStatus(ticketId: number, remarks: string, status: string): Observable<Ticket> {
    let params = new HttpParams()
    .set('remarks', remarks)
    .set('status', status);

    return this.http.put<Ticket>(`${this.apiUrl}/${ticketId}/remark`, null, { params });
  }
}