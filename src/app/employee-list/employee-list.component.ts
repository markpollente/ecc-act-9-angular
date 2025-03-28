import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';

import { AuthService } from '@services/auth.service';
import { EmployeeService } from '@services/employee.service';
import { RoleService } from '@services/role.service';

import { Employee } from '@models/employee.model';
import { Role } from '@models/role.model';
import { EmployeeModalComponent } from '../employee-modal/employee-modal.component';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';
import { LoadingComponent } from '@shared/components/loading/loading.component';

interface Filters {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  birthday: string;
  age: string;
  address: string;
  contactNumber: string;
  employmentStatus: string;
  roles: string;
  createdDateStart: string;
  createdDateEnd: string;
  updatedDateStart: string;
  updatedDateEnd: string;
  createdBy: string;
  updatedBy: string;
}

@Component({
  selector: 'app-employee-list',
  imports: [
    CommonModule,
    FormsModule,
    EmployeeModalComponent,
    PaginationComponent,
    RouterModule,
    LoadingComponent],
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.scss']
})
export class EmployeeListComponent implements OnInit {
  employees: Employee[] = [];
  roles: Role[] = [];
  loading = true;
  error: string | null = null;
  newEmployee: Employee = this.getEmptyEmployee();
  isEditing = false;
  editingEmployeeId: number | null | undefined = null;
  selectedRoleId: number | null = null;
  filters: Filters = this.getEmptyFilters();

  // Pagination properties
  currentPage = 1;
  totalPages = 1;
  pageSize = 3;
  totalItems: number = 0;

  constructor(
    private employeeService: EmployeeService,
    private authService: AuthService,
    private router: Router,
    private roleService: RoleService
  ) { }

  ngOnInit(): void {
    if (!this.authService.isAdmin()) {
      this.router.navigate(['/']);
      return;
    }

    this.loadEmployees();
    this.loadRoles();
  }

  loadEmployees(): void {
    this.loading = true;
    this.employeeService.getAllEmployeesWithFilters({ ...this.filters, page: this.currentPage - 1, size: this.pageSize}).subscribe({
      next: (data) => {
        this.employees = data.content;
        this.totalPages = data.totalPages;
        this.totalItems = data.totalElements;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load employees';
        this.loading = false;
      }
    });
  }

  loadRoles(): void {
    this.roleService.getAllRoles(0, 10).subscribe({
      next: (data) => {
        this.roles = data.content;
      },
      error: (err) => {
        this.error = 'Failed to load roles';
      }
    });
  }

  applyFilters(): void {
    this.loadEmployees();
  }

  clearFilters(): void {
    this.filters = this.getEmptyFilters();
    this.resetDateInputs();
  }

  getRoles(employee: Employee): string {
    return employee.roles ? employee.roles.map(role => role.name).join(', ') : '';
  }

  openCreateEmployeeModal(): void {
    this.isEditing = false;
    this.newEmployee = this.getEmptyEmployee();
    this.selectedRoleId = null;
  }

  createEmployee(event: { form: NgForm, selectedRoleId: number | null }): void {
    const { form, selectedRoleId } = event;
    this.selectedRoleId = selectedRoleId;
    if (form.invalid) {
      return;
    }
    this.employeeService.createEmployee(this.newEmployee).subscribe({
      next: (employee) => {
        this.employees.push(employee);
        this.assignRoleToEmployee(employee.id!);
        this.getEmptyEmployee();
        this.isEditing = false;
      },
      error: (err) => {
        this.error = 'Failed to create employee';
      }
    });
  }

  editEmployee(employee: Employee): void {
    this.newEmployee = { ...employee };
    this.isEditing = true;
    this.editingEmployeeId = employee.id;
  }

  updateEmployee(event: { form: NgForm, selectedRoleId: number | null }): void {
    const { form, selectedRoleId } = event;
    this.selectedRoleId = selectedRoleId;
    if (form.invalid) {
      return;
    }
    if (this.editingEmployeeId !== null && this.editingEmployeeId !== undefined) {
      this.employeeService.updateEmployee(this.editingEmployeeId, this.newEmployee).subscribe({
        next: (updatedEmployee) => {
          const index = this.employees.findIndex(emp => emp.id === this.editingEmployeeId);
          if (index !== -1) {
            this.employees[index] = updatedEmployee;
          }
          console.log(selectedRoleId);
          if (this.editingEmployeeId !== null && this.editingEmployeeId !== undefined) {
            this.assignRoleToEmployee(this.editingEmployeeId);
          }
          this.getEmptyEmployee();
          this.isEditing = false;
          this.editingEmployeeId = null;
        },
        error: (err) => {
          this.error = 'Failed to update employee';
        }
      });
    }
  }

  confirmDeleteEmployee(employeeId: number): void {
    if (confirm('Are you sure you want to delete this employee?')) {
      this.deleteEmployee(employeeId);
    }
  }

  deleteEmployee(employeeId: number): void {
    this.employeeService.deleteEmployee(employeeId).subscribe({
      next: () => {
        this.employees = this.employees.filter(emp => emp.id !== employeeId);
      },
      error: (err) => {
        console.error('Failed to delete employee:', err);
        this.error = 'Failed to delete employee';
      }
    });
  }

  assignRoleToEmployee(employeeId: number): void {
    if (this.selectedRoleId !== null) {
      this.employeeService.assignRoleToEmployee(employeeId, this.selectedRoleId).subscribe({
        next: (employee) => {
          const index = this.employees.findIndex(emp => emp.id === employeeId);
          if (index !== -1) {
            this.employees[index] = employee;
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
    this.loadEmployees();
  }
  
  onItemsPerPageChange(itemsPerPage: number): void {
    this.pageSize = itemsPerPage;
    this.loadEmployees();
  }
  
  private getEmptyEmployee(): Employee {
    return {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      birthday: '',
      address: '',
      contactNumber: '',
      employmentStatus: '',
      createdDate: '',
      updatedDate: '',
      createdBy: '',
      updatedBy: ''
    };
  }

  private getEmptyFilters(): Filters {
    return {
      id: '',
      firstName: '',
      lastName: '',
      email: '',
      birthday: '',
      age: '',
      address: '',
      contactNumber: '',
      employmentStatus: '',
      roles: '',
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