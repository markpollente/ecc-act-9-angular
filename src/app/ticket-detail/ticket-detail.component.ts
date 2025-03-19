import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TicketService } from '@services/ticket.service';
import { EmployeeService } from '@services/employee.service';

import { Ticket } from '@models/ticket.model';
import { Employee } from '@models/employee.model';

@Component({
  selector: 'app-ticket-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ticket-detail.component.html',
  styleUrls: ['./ticket-detail.component.scss']
})
export class TicketDetailComponent implements OnInit {
  ticket: Ticket | null = null;
  loading = true;
  error: string | null = null;
  employees: Employee[] = [];
  selectedEmployeeId: number | null = null;
  newRemark: string = '';
  ticketStatuses: string[] = ['FILED', 'DRAFT', 'INPROGRESS', 'DUPLICATE', 'CLOSED'];
  selectedStatus: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ticketService: TicketService,
    private employeeService: EmployeeService
  ) {}

  ngOnInit(): void {
    this.loadTicket();
    this.loadEmployees();
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
        },
        error: (err) => {
          this.error = 'Failed to load ticket details';
          this.loading = false;
        }
      });
    }
  }

  loadEmployees(): void {
    this.employeeService.getAllEmployees(0, 100).subscribe({
      next: (data) => {
        this.employees = data.content;
      },
      error: (err) => {
        console.error('Failed to load employees', err);
      }
    });
  }

  updateTicketStatus(): void {
    if (!this.ticket?.id) return;
    console.log(this.newRemark);
    
    this.ticketService.addRemarkAndUpdateStatus(
      this.ticket.id, 
      this.newRemark, 
      this.selectedStatus
    ).subscribe({
      next: (updatedTicket) => {
        this.ticket = updatedTicket;
        this.newRemark = '';
        // Show success message
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
        // Show success message
      },
      error: (err) => {
        console.error('Failed to assign ticket', err);
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