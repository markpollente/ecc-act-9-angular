import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { EmployeeDto } from '../../models/employee.dto';
import { EmployeeService } from '../employee.service';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { RoleService } from '../role.service';
import { RoleDto } from '../../models/role.dto';

@Component({
  selector: 'app-employee-list',
  imports: [CommonModule, FormsModule],
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.scss']
})
export class EmployeeListComponent implements OnInit {
  employees: EmployeeDto[] = [];
  roles: RoleDto[] = [];
  loading = true;
  error: string | null = null;
  newEmployee: EmployeeDto = {
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
  showForm = false;
  isEditing = false;
  editingEmployeeId: number | null | undefined = null;
  selectedRoleId: number | null = null;
  filters = {
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

  constructor(
    private employeeService: EmployeeService,
    private authService: AuthService,
    private router: Router,
    private roleService: RoleService
  ) {}

  ngOnInit(): void {
    if (!this.authService.isAdmin()) {
      this.router.navigate(['/']);
      return;
    }

    this.loadEmployees();

    this.roleService.getAllRoles(0, 10).subscribe({
      next: (data) => {
        this.roles = data.content;
      },
      error: (err) => {
        this.error = 'Failed to load roles';
      }
    });
  }

  loadEmployees(): void {
    this.loading = true;
    this.employeeService.getAllEmployeesWithFilters(this.filters).subscribe({
      next: (data) => {
        this.employees = data.content;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load employees';
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    this.loadEmployees();
  }

  clearFilters(): void {
    this.filters = {
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
  
    const createdDateStartInput = document.getElementById('filterCreatedDateStart') as HTMLInputElement;
    const createdDateEndInput = document.getElementById('filterCreatedDateEnd') as HTMLInputElement;
    const updatedDateStartInput = document.getElementById('filterUpdatedDateStart') as HTMLInputElement;
    const updatedDateEndInput = document.getElementById('filterUpdatedDateEnd') as HTMLInputElement;
  
    if (createdDateStartInput) createdDateStartInput.value = '';
    if (createdDateEndInput) createdDateEndInput.value = '';
    if (updatedDateStartInput) updatedDateStartInput.value = '';
    if (updatedDateEndInput) updatedDateEndInput.value = '';
  }

  getRoles(employee: EmployeeDto): string {
    return employee.roles ? employee.roles.map(role => role.name).join(', ') : '';
  }

  createEmployee(form: NgForm): void {
    if (form.invalid) {
      return;
    }
    this.employeeService.createEmployee(this.newEmployee).subscribe({
      next: (employee) => {
        this.employees.push(employee);
        this.assignRoleToEmployee(employee.id!);
        this.newEmployee = {
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
        this.showForm = false; // Hide form after creating employee
      },
      error: (err) => {
        this.error = 'Failed to create employee';
      }
    });
  }

  editEmployee(employee: EmployeeDto): void {
    this.newEmployee = { ...employee };
    this.isEditing = true;
    this.editingEmployeeId = employee.id;
    this.showForm = true;
  }

  updateEmployee(form: NgForm): void {
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
          if (this.editingEmployeeId !== null && this.editingEmployeeId !== undefined) {
            this.assignRoleToEmployee(this.editingEmployeeId);
          }
          this.newEmployee = {
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
          this.isEditing = false;
          this.editingEmployeeId = null;
          this.showForm = false;
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

  toggleForm(): void {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.isEditing = false;
      this.editingEmployeeId = null;
      this.newEmployee = {
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
      this.selectedRoleId = null;
    }
  }
}