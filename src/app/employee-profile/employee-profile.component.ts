import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { EmployeeService } from '@services/employee.service';

import { Ticket } from '@models/ticket.model';

@Component({
  selector: 'app-employee-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './employee-profile.component.html',
  styleUrls: ['./employee-profile.component.scss']
})
export class EmployeeProfileComponent implements OnInit {
  profile: any;
  filedTickets: Ticket[] = [];
  assignedTickets: Ticket[] = [];
  
  loading = {
    profile: true,
    filed: true,
    assigned: true
  };
  
  error = {
    profile: null as string | null,
    filed: null as string | null,
    assigned: null as string | null
  };

  constructor(private employeeService: EmployeeService) { }

  ngOnInit(): void {
    this.employeeService.getProfile().subscribe({
      next: (data) => {
        this.profile = data;
        this.loading.profile = false;
      },
      error: (err) => {
        this.error.profile = 'Failed to load profile data';
        this.loading.profile = false;
        console.error('Error loading profile:', err);
      }
    });

    this.employeeService.getFiledTickets().subscribe({
      next: (data) => {
        this.filedTickets = data;
        this.loading.filed = false;
      },
      error: (err) => {
        this.error.filed = 'Failed to load filed tickets';
        this.loading.filed = false;
        console.error('Error loading filed tickets:', err);
      }
    });

    this.employeeService.getAssignedTickets().subscribe({
      next: (data) => {
        this.assignedTickets = data;
        this.loading.assigned = false;
      },
      error: (err) => {
        this.error.assigned = 'Failed to load assigned tickets';
        this.loading.assigned = false;
        console.error('Error loading assigned tickets:', err);
      }
    });
  }
  
  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'FILED': return 'bg-info';
      case 'INPROGRESS': return 'bg-warning';
      case 'CLOSED': return 'bg-success';
      case 'DRAFT': return 'bg-secondary';
      case 'DUPLICATE': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }
}