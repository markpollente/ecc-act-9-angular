import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { EmployeeService } from '@services/employee.service';
import { RoleService } from '@services/role.service';
import { AuthService } from '@services/auth.service';

import { Employee } from '@models/employee.model';
import { Role } from '@models/role.model';

@Component({
  selector: 'app-employee-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './employee-detail.component.html',
  styleUrls: ['./employee-detail.component.scss']
})
export class EmployeeDetailComponent implements OnInit {
  employee: Employee | null = null;
  roles: Role[] = [];
  loading = true;
  error: string | null = null;
  isEditing = false;
  selectedRoleId: number | null = null;
  editFormData: any = {};
  passwordEditEnabled = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private employeeService: EmployeeService,
    private roleService: RoleService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadEmployee();
    this.loadRoles();
  }

  loadEmployee(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.employeeService.getEmployeeById(+id).subscribe({
        next: (data) => {
          this.employee = data;
          this.loading = false;
          this.initEditFormData();
        },
        error: (err) => {
          this.error = 'Failed to load employee details';
          this.loading = false;
        }
      });
    }
  }

  loadRoles(): void {
    this.roleService.getAllRoles(0, 100).subscribe({
      next: (data) => {
        this.roles = data.content;
      },
      error: (err) => {
        this.error = 'Failed to load roles';
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
    if (!this.employee) return;

    this.editFormData = {
      firstName: this.employee.firstName,
      lastName: this.employee.lastName,
      email: this.employee.email,
      birthday: this.employee.birthday || '',
      address: this.employee.address || '',
      contactNumber: this.employee.contactNumber || '',
      employmentStatus: this.employee.employmentStatus || '',
      password: '',
      selectedRoleId: this.employee.roles && this.employee.roles.length > 0 ? 
                      this.employee.roles[0].id : null
    };
  }

  togglePasswordEdit(): void {
    this.passwordEditEnabled = !this.passwordEditEnabled;
    if (this.passwordEditEnabled) {
      this.editFormData.password = '';
    }
  }

  saveChanges(): void {
    if (!this.employee?.id) return;

    const updatedEmployee: Employee = {
      ...this.employee,
      firstName: this.editFormData.firstName,
      lastName: this.editFormData.lastName,
      email: this.editFormData.email,
      birthday: this.editFormData.birthday,
      address: this.editFormData.address,
      contactNumber: this.editFormData.contactNumber,
      employmentStatus: this.editFormData.employmentStatus
    };

    if (this.passwordEditEnabled && this.editFormData.password) {
      updatedEmployee.password = this.editFormData.password;
    }

    this.employeeService.updateEmployee(this.employee.id, updatedEmployee).subscribe({
      next: (result) => {
        this.employee = result;
        
        const currentRoleId = this.employee.roles && this.employee.roles.length > 0 ? 
                              this.employee.roles[0].id : null;
        
        if (this.editFormData.selectedRoleId !== currentRoleId && this.editFormData.selectedRoleId !== null) {
          this.assignRole(this.editFormData.selectedRoleId);
        } else {
          this.isEditing = false;
        }
      },
      error: (err) => {
        console.error('Failed to update employee', err);
      }
    });
  }

  assignRole(roleId: number): void {
    if (!this.employee?.id) return;

    this.employeeService.assignRoleToEmployee(this.employee.id, roleId).subscribe({
      next: (updatedEmployee) => {
        this.employee = updatedEmployee;
        this.isEditing = false;
      },
      error: (err) => {
        console.error('Failed to assign role', err);
      }
    });
  }

  deleteEmployee(): void {
    if (!this.employee?.id || !confirm('Are you sure you want to delete this employee?')) return;

    this.employeeService.deleteEmployee(this.employee.id).subscribe({
      next: () => {
        this.router.navigate(['/employees']);
      },
      error: (err) => {
        this.error = 'Failed to delete employee';
        console.error('Failed to delete employee', err);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/employees']);
  }

  canEditEmployee(): boolean {
    return this.authService.isAdmin();
  }

  getRoleName(employee: Employee): string {
    return employee.roles && employee.roles.length > 0 ? employee.roles[0].name : 'No Role';
  }
}