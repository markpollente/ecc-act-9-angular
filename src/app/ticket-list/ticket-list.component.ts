import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';

import { Ticket } from '@models/ticket.model';
import { Employee } from '@models/employee.model';

import { TicketService } from '@services/ticket.service';
import { EmployeeService } from '@services/employee.service';
import { TicketModalComponent } from 'app/ticket-modal/ticket-modal.component';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';

interface Filters {
  ticketNo: string;
  title: string;
  status: string;
  assignee: string;
  createdDateStart: string;
  createdDateEnd: string;
  updatedDateStart: string;
  updatedDateEnd: string;
  createdBy: string;
  updatedBy: string;
}

@Component({
  selector: 'app-ticket-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TicketModalComponent, PaginationComponent],
  templateUrl: './ticket-list.component.html',
  styleUrls: ['./ticket-list.component.scss']
})
export class TicketListComponent implements OnInit {
  tickets: Ticket[] = [];
  employees: Employee[] = [];
  ticketStatuses: string[] = ['FILED', 'DRAFT', 'INPROGRESS', 'DUPLICATE', 'CLOSED'];
  filters: Filters = this.getEmptyFilters();
  newTicket: Ticket = this.getEmptyTicket();
  isEditing = false;
  editingTicketId: number | null | undefined = null;
  selectedEmployeeId: number | null = null;
  loading = true;
  error: string | null = null;

  // Pagination properties
  currentPage = 1;
  totalPages = 1;
  pageSize = 3;
  totalItems: number = 0;

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
        this.totalItems = data.totalElements;
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
    this.filters = this.getEmptyFilters();
    this.resetDateInputs();
  }

  openCreateTicketModal(): void {
    this.isEditing = false;
    this.newTicket = this.getEmptyTicket();
    this.selectedEmployeeId = null;
  }

  createTicket(event: { form: NgForm, selectedEmployeeId: number | null }): void {
    const { form, selectedEmployeeId } = event;
    this.selectedEmployeeId = selectedEmployeeId;
    if (form.invalid) {
      return;
    }
    this.ticketService.createTicket(this.newTicket).subscribe({
      next: (ticket) => {
        this.tickets.push(ticket);
        this.assignTicketToEmployee(ticket.id!);
        this.getEmptyTicket();
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

  updateTicket(event: { form: NgForm, selectedEmployeeId: number | null }): void {
    const { form, selectedEmployeeId } = event;
    this.selectedEmployeeId = selectedEmployeeId;
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
          console.log(selectedEmployeeId);
          if (this.editingTicketId !== null && this.editingTicketId !== undefined) {
            this.assignTicketToEmployee(this.editingTicketId);
          }
          this.getEmptyTicket();
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

  assignTicketToEmployee(ticketId: number): void {
    if (this.selectedEmployeeId !== null) {
      this.ticketService.assignTicketToEmployee(ticketId, this.selectedEmployeeId).subscribe({
        next: (ticket) => {
          const index = this.tickets.findIndex(t => t.id === ticketId);
          if (index !== -1) {
            this.tickets[index] = ticket;
          }
        },
        error: (err) => {
          this.error = 'Failed to assign role';
        }
      });
    }
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadTickets();
  }

  onItemsPerPageChange(itemsPerPage: number): void {
    this.pageSize = itemsPerPage;
    this.loadTickets();
  }

  private getEmptyTicket(): Ticket {
      return {
        ticketNo: '',
        title: '',
        status: '',
        body: '',
        createdDate: '',
        updatedDate: '',
        createdBy: '',
        updatedBy: ''
      };
  }

  private getEmptyFilters(): Filters {
    return {
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
  }

  private resetDateInputs(): void {
    const createdDateStartInput = document.getElementById('filterCreatedDateStart') as HTMLInputElement;
    const createdDateEndInput = document.getElementById('filterCreatedDateEnd') as HTMLInputElement;
    const updatedDateStartInput = document.getElementById('filterUpdatedDateStart') as HTMLInputElement;
    const updatedDateEndInput = document.getElementById('filterUpdatedDateEnd') as HTMLInputElement;

    if (createdDateStartInput) createdDateStartInput.value = '';
    if (createdDateEndInput) createdDateEndInput.value = '';
    if (updatedDateStartInput) updatedDateStartInput.value = '';
    if (updatedDateEndInput) updatedDateEndInput.value = '';
  }
}