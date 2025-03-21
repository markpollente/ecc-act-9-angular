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
import { AuthService } from '@core/services/auth.service';

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
  currentPage = 1;
  totalPages = 1;
  pageSize = 3;
  totalItems: number = 0;
  availableFilters = [
    { id: 'ticketNo', name: 'Ticket No' },
    { id: 'title', name: 'Title' },
    { id: 'status', name: 'Status', default: true },
    { id: 'assignee', name: 'Assignee' },
    { id: 'createdDateRange', name: 'Created Date Range' },
    { id: 'updatedDateRange', name: 'Updated Date Range' },
    { id: 'createdBy', name: 'Created By' },
    { id: 'updatedBy', name: 'Updated By' }
  ];
  availableColumns = [
    { id: 'ticketNo', name: 'Ticket No', default: true },
    { id: 'title', name: 'Title', default: true },
    { id: 'status', name: 'Status', default: true },
    { id: 'assignee', name: 'Assignee', default: false },
    { id: 'createdDate', name: 'Created Date', default: false },
    { id: 'updatedDate', name: 'Updated Date', default: true },
    { id: 'createdBy', name: 'Created By', default: false },
    { id: 'updatedBy', name: 'Updated By', default: false }
  ];
  groupByOptions = [
    { id: 'none', name: 'No grouping' },
    { id: 'status', name: 'Status' },
    { id: 'assignee', name: 'Assignee' },
    { id: 'createdBy', name: 'Created by' },
    { id: 'updatedBy', name: 'Updated by' }
  ];
  showDescription: boolean = false;
  selectedColumns: string[] = [];
  activeFilters: string[] = [];
  pendingShowDescription: boolean = false;
  pendingSelectedColumns: string[] = [];
  pendingGroupBy: string = 'none';
  groupBy: string = 'none';

  constructor(
    private ticketService: TicketService,
    private employeeService: EmployeeService,
    private authService: AuthService,
  ) { }

  ngOnInit(): void {
    this.activeFilters = this.availableFilters
      .filter(f => f.default)
      .map(f => f.id);

    this.selectedColumns = this.availableColumns
      .filter(c => c.default)
      .map(c => c.id);

    this.pendingShowDescription = this.showDescription;
    this.pendingSelectedColumns = [...this.selectedColumns];

    this.applyRoleBasedFilters();
  }

  applyRoleBasedFilters(): void {
    this.loadEmployeeDirectory();
    
    if (this.authService.isAdmin()) {
      this.loadTickets();
    } else {
      this.loadRelevantTickets();
    }
  }

  loadEmployeeDirectory(): void {
    this.employeeService.getEmployeeDirectory(0, 100).subscribe({
      next: (data) => {
        this.employees = data.content;
      },
      error: (err) => {
        this.error = 'Failed to load employee directory';
      }
    });
  }
  
  loadRelevantTickets(): void {
    this.loading = true;
    this.error = null;
    
    this.ticketService.getRelevantTicketsWithFilters(
      { ...this.filters, page: this.currentPage - 1, size: this.pageSize }
    ).subscribe({
      next: (data) => {
        this.tickets = data.content;
        this.totalItems = data.totalElements;
        this.totalPages = data.totalPages;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load tickets';
        this.loading = false;
      }
    });
  }
  
  addFilter(filterId: string): void {
    if (!this.activeFilters.includes(filterId)) {
      this.activeFilters.push(filterId);
    }
  }

  removeFilter(filterId: string): void {
    this.activeFilters = this.activeFilters.filter(id => id !== filterId);

    if (filterId === 'createdDateRange') {
      this.filters.createdDateStart = '';
      this.filters.createdDateEnd = '';
    } else if (filterId === 'updatedDateRange') {
      this.filters.updatedDateStart = '';
      this.filters.updatedDateEnd = '';
    } else if (filterId in this.filters) {
      (this.filters as any)[filterId] = '';
    }
  }

  getColumnName(columnId: string): string {
    const column = this.availableColumns.find(col => col.id === columnId);
    return column ? column.name : '';
  }

  getAvailableColumnsForSelection(): any[] {
    return this.availableColumns.filter(c => !this.pendingSelectedColumns.includes(c.id));
  }

  getSelectedColumnsForDisplay(): any[] {
    return this.availableColumns.filter(c => this.pendingSelectedColumns.includes(c.id));
  }

  addColumn(columnId: string): void {
    if (!this.pendingSelectedColumns.includes(columnId)) {
      this.pendingSelectedColumns.push(columnId);
    }
  }

  removeColumn(columnId: string): void {
    this.pendingSelectedColumns = this.pendingSelectedColumns.filter(id => id !== columnId);
  }

  moveColumnUp(columnId: string): void {
    const index = this.pendingSelectedColumns.indexOf(columnId);
    if (index > 0) {
      this.pendingSelectedColumns.splice(index, 1);
      this.pendingSelectedColumns.splice(index - 1, 0, columnId);
    }
  }

  moveColumnDown(columnId: string): void {
    const index = this.pendingSelectedColumns.indexOf(columnId);
    if (index < this.pendingSelectedColumns.length - 1) {
      this.pendingSelectedColumns.splice(index, 1);
      this.pendingSelectedColumns.splice(index + 1, 0, columnId);
    }
  }

  applyFiltersAndOptions(): void {
    if (this.authService.isAdmin()) {
      this.loadTickets();
    } else {
      this.loadRelevantTickets();
    }
  
    this.showDescription = this.pendingShowDescription;
    this.selectedColumns = [...this.pendingSelectedColumns];
    this.groupBy = this.pendingGroupBy;
  
    localStorage.setItem('selectedColumns', JSON.stringify(this.selectedColumns));
    localStorage.setItem('groupBy', this.groupBy);
  }

  clearFiltersAndOptions(): void {
    this.filters = this.getEmptyFilters();
    this.resetDateInputs();
    this.activeFilters = this.availableFilters
      .filter(f => f.default)
      .map(f => f.id);

    this.pendingShowDescription = false;

    this.pendingSelectedColumns = this.availableColumns
      .filter(c => c.default)
      .map(c => c.id);

    this.pendingGroupBy = 'none';  
  }

  getGroupedTickets(): any {
    if (this.groupBy === 'none') {
      return this.tickets;
    }

    const groupedTickets: any = {};
    
    for (const ticket of this.tickets) {
      let groupValue: string;

      if (this.groupBy === 'status') {
        groupValue = ticket.status || 'No status';
      } else if (this.groupBy === 'assignee') {
        groupValue = ticket.assignee ?
        `${ticket.assignee.firstName} ${ticket.assignee.lastName}` : 'Unassigned';
      } else if (this.groupBy === 'createdBy') {
        groupValue = ticket.createdBy || 'Unknown';
      } else if (this.groupBy === 'updatedBy') {
        groupValue = ticket.updatedBy || 'Unknown';
      } else {
        groupValue = 'Other';
      }

      if(!groupedTickets[groupValue]) {
        groupedTickets[groupValue] = [];
      }

      groupedTickets[groupValue].push(ticket);
    }

    const result: any[] = [];
    for (const group in groupedTickets) {
      result.push({
        name: group,
        tickets: groupedTickets[group],
        isExpanded: true
      });
    }
    return result;
  } 

  isGrouped(): boolean {
    return this.groupBy !== 'none';
  }

  toggleGroup(group: any): void {
    group.isExpanded = !group.isExpanded;
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
    if (this.authService.isAdmin()) {
      this.employeeService.getAllEmployees(0, 10).subscribe({
        next: (data) => {
          this.employees = data.content;
        },
        error: (err) => {
          this.error = 'Failed to load employees';
        }
      });
    } else {
      this.employeeService.getProfile().subscribe({
        next: (profile) => {
          const uniqueEmployees: Employee[] = [profile];
          
          this.tickets.forEach(ticket => {
            if (ticket.assignee && !uniqueEmployees.some(e => e.id === ticket.assignee?.id)) {
              uniqueEmployees.push(ticket.assignee);
            }
          });
          
          this.employees = uniqueEmployees;
        },
        error: (err) => {
          this.error = 'Failed to load employee profile';
        }
      });
    }
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
        this.error = null;
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
    if (this.authService.isAdmin()) {
      this.loadTickets();
    } else {
      this.loadRelevantTickets();
    }
  }
  
  onItemsPerPageChange(itemsPerPage: number): void {
    this.pageSize = itemsPerPage;
    if (this.authService.isAdmin()) {
      this.loadTickets();
    } else {
      this.loadRelevantTickets();
    }
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