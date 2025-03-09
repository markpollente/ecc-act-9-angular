import { Component, OnInit } from '@angular/core';
import { HelpdeskTicketService } from '../ticket.service';
import { HelpdeskTicketDto } from '../../models/helpdesk-ticket.dto';
import { EmployeeService } from '../employee.service';
import { EmployeeDto } from '../../models/employee.dto';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-ticket-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './ticket-list.component.html',
  styleUrls: ['./ticket-list.component.scss']
})
export class TicketListComponent implements OnInit {
  tickets: HelpdeskTicketDto[] = [];
  employees: EmployeeDto[] = [];
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
  newTicket: HelpdeskTicketDto = {
    ticketNo: '',
    title: '',
    body: '',
    status: '',
    assignee: undefined
  };
  showForm = false;
  isEditing = false;
  editingTicketId: number | null | undefined = null;
  loading = true;
  error: string | null = null;

  constructor(
    private ticketService: HelpdeskTicketService,
    private employeeService: EmployeeService
  ) {}

  ngOnInit(): void {
    this.loadTickets();
    this.loadEmployees();
  }

  loadTickets(): void {
    this.loading = true;
    this.ticketService.getAllTicketsWithFilters(this.filters).subscribe({
      next: (data) => {
        this.tickets = data.content;
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
        this.showForm = false;
      },
      error: (err) => {
        this.error = 'Failed to create ticket';
      }
    });
  }

  editTicket(ticket: HelpdeskTicketDto): void {
    this.newTicket = { ...ticket };
    this.isEditing = true;
    this.editingTicketId = ticket.id;
    this.showForm = true;
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
          this.showForm = false;
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

  toggleForm(): void {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.isEditing = false;
      this.editingTicketId = null;
      this.newTicket = {
        ticketNo: '',
        title: '',
        body: '',
        status: '',
        assignee: undefined
      };
    }
  }
}