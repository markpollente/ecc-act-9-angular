import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';

import { EmployeeService } from '@services/employee.service';
import { AuthService } from '@services/auth.service';

import { Ticket } from '@models/ticket.model';
import { Employee } from '@models/employee.model';
import { LoadingComponent } from '@shared/components/loading/loading.component';

@Component({
  selector: 'app-employee-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule,
    LoadingComponent],
  templateUrl: './employee-profile.component.html',
  styleUrls: ['./employee-profile.component.scss']
})
export class EmployeeProfileComponent implements OnInit {
  profile: Employee | null = null;
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

  isEditing = false;
  editFormData: any = {};
  passwordEditEnabled = false;

  constructor(
    private employeeService: EmployeeService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadProfileData();
    this.loadTickets();
  }

  loadProfileData(): void {
    this.employeeService.getProfile().subscribe({
      next: (data) => {
        this.profile = data;
        this.loading.profile = false;
        this.initEditFormData();
      },
      error: (err) => {
        this.error.profile = 'Failed to load profile data';
        this.loading.profile = false;
        console.error('Error loading profile:', err);
      }
    });
  }

  loadTickets(): void {
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

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    this.passwordEditEnabled = false;
    if (this.isEditing) {
      this.initEditFormData();
    }
  }

  initEditFormData(): void {
    if (!this.profile) return;

    this.editFormData = {
      firstName: this.profile.firstName,
      lastName: this.profile.lastName,
      email: this.profile.email,
      birthday: this.profile.birthday || '',
      address: this.profile.address || '',
      contactNumber: this.profile.contactNumber || '',
      employmentStatus: this.profile.employmentStatus || '',
      password: ''
    };
  }

  togglePasswordEdit(): void {
    this.passwordEditEnabled = !this.passwordEditEnabled;
    if (this.passwordEditEnabled) {
      this.editFormData.password = '';
    }
  }

  saveChanges(): void {
    if (!this.profile) return;

    const updatedProfile: Partial<Employee> = {
      firstName: this.editFormData.firstName,
      lastName: this.editFormData.lastName,
      email: this.editFormData.email,
      birthday: this.editFormData.birthday,
      address: this.editFormData.address,
      contactNumber: this.editFormData.contactNumber,
      employmentStatus: this.editFormData.employmentStatus
    };

    if (this.passwordEditEnabled && this.editFormData.password) {
      updatedProfile.password = this.editFormData.password;
    }

    this.employeeService.updateCurrentUserProfile(updatedProfile).subscribe({
      next: (response) => {
        this.profile = response.employee;
        this.isEditing = false;

        if (response.emailChanged) {          
          this.authService.logout();
          this.router.navigate(['/login']);
        } else {
          this.loadProfileData();
        }
      },
      error: (err) => {
        if (err.error?.message?.includes('already in use')) {
          this.error.profile = 'This email address is already in use';
        } else {
          this.error.profile = 'Failed to update profile';
        }
        console.error('Failed to update profile', err);
      }
    });
  }

  getRoleName(): string {
    return this.profile?.roles && this.profile.roles.length > 0
      ? this.profile.roles[0].name
      : 'No Role';
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