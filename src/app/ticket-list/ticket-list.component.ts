import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';

import { Ticket } from '@models/ticket.model';
import { Employee } from '@models/employee.model';

import { TicketService } from '@services/ticket.service';
import { EmployeeService } from '@services/employee.service';
import { TicketModalComponent } from 'app/ticket-modal/ticket-modal.component';

@Component({
  selector: 'app-ticket-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TicketModalComponent],
  templateUrl: './ticket-list.component.html',
  styleUrls: ['./ticket-list.component.scss']
})
export class TicketListComponent implements OnInit {
  tickets: Ticket[] = [];
  employees: Employee[] = [];
  ticketStatuses: string[] = ['FILED', 'DRAFT', 'INPROGRESS', 'DUPLICATE', 'CLOSED'];
  filters: {
    ticketNo: string;
    title: string;
    status: string;
    assignee?: string | null;
    createdDateStart?: string;
    createdDateEnd?: string;
    updatedDateStart?: string;
    updatedDateEnd?: string;
    createdBy?: string;
    updatedBy?: string;
  } = {
      ticketNo: '',
      title: '',
      status: '',
      assignee: '',
      createdDateStart: '',
      createdDateEnd: '',
      updatedDateStart: '',
      updatedDateEnd: '',
      createdBy: '',
      updatedBy: ''
    };
  newTicket: Ticket = {
    ticketNo: '',
    title: '',
    body: '',
    status: '',
    assignee: undefined
  };
  isEditing = false;
  editingTicketId: number | null | undefined = null;
  selectedEmployeeId: number | null = null;
  loading = true;
  error: string | null = null;

  // Pagination properties
  currentPage = 1;
  totalPages = 1;
  pageSize = 3;
  pages: number[] = [];

  constructor(
    private ticketService: TicketService,
    private employeeService: EmployeeService
  ) { }

  ngOnInit(): void {
    this.loadTickets();
    this.loadEmployees();
  }

  loadTickets(): void {
    this.loading = true;
    this.ticketService.getAllTicketsWithFilters({ ...this.filters, page: this.currentPage - 1, size: this.pageSize }).subscribe({
      next: (data) => {
        this.tickets = data.content;
        this.totalPages = data.totalPages;
        this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1)
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load tickets';
        this.loading = false;
      }
    });
  }

  loadEmployees(): void {
    this.employeeService.getAllEmployees(0, 10).subscribe({
      next: (data) => {
        this.employees = data.content;
      },
      error: (err) => {
        this.error = 'Failed to load employees';
      }
    });
  }

  applyFilters(): void {
    this.loadTickets();
  }

  clearFilters(): void {
    this.filters = {
      ticketNo: '',
      title: '',
      status: '',
      assignee: '',
      createdDateStart: '',
      createdDateEnd: '',
      updatedDateStart: '',
      updatedDateEnd: '',
      createdBy: '',
      updatedBy: ''
    };

    const createdDateStartInput = document.getElementById('filterCreatedDateStart') as HTMLInputElement;
    const createdDateEndInput = document.getElementById('filterCreatedDateEnd') as HTMLInputElement;
    const updatedDateStartInput = document.getElementById('filterUpdatedDateStart') as HTMLInputElement;
    const updatedDateEndInput = document.getElementById('filterUpdatedDateEnd') as HTMLInputElement;

    if (createdDateStartInput) createdDateStartInput.value = '';
    if (createdDateEndInput) createdDateEndInput.value = '';
    if (updatedDateStartInput) updatedDateStartInput.value = '';
    if (updatedDateEndInput) updatedDateEndInput.value = '';
  }

  createTicket(form: NgForm): void {
    if (form.invalid) {
      return;
    }
    this.ticketService.createTicket(this.newTicket).subscribe({
      next: (ticket) => {
        this.tickets.push(ticket);
        this.newTicket = {
          ticketNo: '',
          title: '',
          body: '',
          status: '',
          assignee: undefined
        };
        this.isEditing = false;
      },
      error: (err) => {
        this.error = 'Failed to create ticket';
      }
    });
  }

  editTicket(ticket: Ticket): void {
    this.newTicket = { ...ticket };
    this.isEditing = true;
    this.editingTicketId = ticket.id;
  }

  updateTicket(form: NgForm): void {
    if (form.invalid) {
      return;
    }
    if (this.editingTicketId !== null && this.editingTicketId !== undefined) {
      this.ticketService.updateTicket(this.editingTicketId, this.newTicket).subscribe({
        next: (updatedTicket) => {
          const index = this.tickets.findIndex(t => t.id === this.editingTicketId);
          if (index !== -1) {
            this.tickets[index] = updatedTicket;
          }
          this.newTicket = {
            ticketNo: '',
            title: '',
            body: '',
            status: '',
            assignee: undefined
          };
          this.isEditing = false;
          this.editingTicketId = null;
        },
        error: (err) => {
          this.error = 'Failed to update ticket';
        }
      });
    }
  }

  confirmDeleteTicket(ticketId: number): void {
    if (confirm('Are you sure you want to delete this ticket?')) {
      this.deleteTicket(ticketId);
    }
  }

  deleteTicket(ticketId: number): void {
    this.ticketService.deleteTicket(ticketId).subscribe({
      next: () => {
        this.tickets = this.tickets.filter(t => t.id !== ticketId);
      },
      error: (err) => {
        this.error = 'Failed to delete ticket';
      }
    });
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadTickets();
    }
  }
}