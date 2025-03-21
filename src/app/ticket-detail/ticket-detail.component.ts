import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TicketService } from '@services/ticket.service';
import { EmployeeService } from '@services/employee.service';

import { Ticket } from '@models/ticket.model';
import { EmployeeRef } from '@models/employeeRef.model';

@Component({
  selector: 'app-ticket-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './ticket-detail.component.html',
  styleUrls: ['./ticket-detail.component.scss']
})
export class TicketDetailComponent implements OnInit {
  ticket: Ticket | null = null;
  loading = true;
  error: string | null = null;
  employees: EmployeeRef[] = [];
  selectedEmployeeId: number | null = null;
  newRemark: string = '';
  ticketStatuses: string[] = ['FILED', 'DRAFT', 'INPROGRESS', 'DUPLICATE', 'CLOSED'];
  selectedStatus: string = '';
  isEditing: boolean = false;
  editFormData: any = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ticketService: TicketService,
    private employeeService: EmployeeService
  ) { }

  ngOnInit(): void {
    this.loadTicket();
    this.loadEmployeeReferences();
  }

  loadTicket(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.ticketService.getTicketById(+id).subscribe({
        next: (data) => {
          this.ticket = data;
          this.selectedStatus = data.status;
          this.selectedEmployeeId = data.assignee?.id || null;
          this.loading = false;
          this.initEditFormData();
        },
        error: (err) => {
          this.error = 'Failed to load ticket details';
          this.loading = false;
        }
      });
    }
  }

  loadEmployeeReferences(): void {
    this.employeeService.getEmployeeReferences().subscribe({
      next: (employees) => {
        this.employees = employees;
      },
      error: (err) => {
        this.error = 'Failed to load employee list';
      }
    });
  }

  updateTicketStatus(): void {
    if (!this.ticket?.id) return;

    this.ticketService.addRemarkAndUpdateStatus(
      this.ticket.id,
      this.newRemark,
      this.selectedStatus
    ).subscribe({
      next: (updatedTicket) => {
        this.ticket = updatedTicket;
        this.newRemark = '';
      },
      error: (err) => {
        console.error('Failed to update ticket status', err);
      }
    });
  }

  assignTicket(): void {
    if (!this.ticket?.id || this.selectedEmployeeId === null) return;

    this.ticketService.assignTicketToEmployee(this.ticket.id, this.selectedEmployeeId).subscribe({
      next: (updatedTicket) => {
        this.ticket = updatedTicket;
      },
      error: (err) => {
        console.error('Failed to assign ticket', err);
      }
    });
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (this.isEditing) {
      this.initEditFormData();
    }
  }

  initEditFormData(): void {
    if (!this.ticket) return;

    this.editFormData = {
      title: this.ticket.title,
      body: this.ticket.body,
      status: this.ticket.status,
      remarks: this.ticket.remarks || '',
      assigneeId: this.ticket.assignee?.id || null
    };
  }

  saveChanges(): void {
    if (!this.ticket?.id) return;

    const updatedTicket: Ticket = {
      ...this.ticket,
      title: this.editFormData.title,
      body: this.editFormData.body,
      status: this.editFormData.status,
      remarks: this.editFormData.remarks
    };

    this.ticketService.updateTicket(this.ticket.id, updatedTicket).subscribe({
      next: (result) => {
        this.ticket = result;

        if (this.editFormData.assigneeId !== (this.ticket.assignee?.id || null)) {
          this.selectedEmployeeId = this.editFormData.assigneeId;
          this.assignTicket();
        }

        this.isEditing = false;
      },
      error: (err) => {
        console.error('Failed to update ticket', err);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/tickets']);
  }

  deleteTicket(): void {
    if (!this.ticket?.id || !confirm('Are you sure you want to delete this ticket?')) return;

    this.ticketService.deleteTicket(this.ticket.id).subscribe({
      next: () => {
        this.router.navigate(['/tickets']);
      },
      error: (err) => {
        console.error('Failed to delete ticket', err);
      }
    });
  }
}