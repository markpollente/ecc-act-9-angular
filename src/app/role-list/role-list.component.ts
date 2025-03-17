import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';

import { RoleService } from '@services/role.service';

import { Role } from '@models/role.model';
import { RoleModalComponent } from 'app/role-modal/role-modal.component';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';

@Component({
  selector: 'app-role-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RoleModalComponent, PaginationComponent],
  templateUrl: './role-list.component.html',
  styleUrls: ['./role-list.component.scss']
})
export class RoleListComponent implements OnInit {
  roles: Role[] = [];
  loading = true;
  error: string | null = null;
  showForm = false;
  isEditing = false;
  editingRoleId: number | null | undefined = null;
  newRole: Role = {
    name: '',
    description: ''
  };

  // Pagination properties
  currentPage = 1;
  totalPages = 1;
  pageSize = 3;

  constructor(private roleService: RoleService) {}

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.loading = true;
    this.roleService.getAllRoles (this.currentPage - 1, this.pageSize).subscribe({
      next: (data) => {
        this.roles = data.content;
        this.totalPages = data.totalPages;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load roles';
        this.loading = false;
      }
    });
  }

  createRole(form: NgForm): void {
    if (form.invalid) {
      return;
    }
    this.roleService.createRole(this.newRole).subscribe({
      next: (role) => {
        this.roles.push(role);
        this.newRole = {
          name: '',
          description: ''
        };
        this.showForm = false;
      },
      error: (err) => {
        this.error = 'Failed to create role';
      }
    });
  }

  editRole(role: Role): void {
    this.newRole = { ...role };
    this.isEditing = true;
    this.editingRoleId = role.id;
    this.showForm = true;
  }

  updateRole(form: NgForm): void {
    if (form.invalid) {
      return;
    }
    if (this.editingRoleId !== null && this.editingRoleId !== undefined) {
      this.roleService.updateRole(this.editingRoleId, this.newRole).subscribe({
        next: (updatedRole) => {
          const index = this.roles.findIndex(role => role.id === this.editingRoleId);
          if (index !== -1) {
            this.roles[index] = updatedRole;
          }
          this.newRole = {
            name: '',
            description: ''
          };
          this.isEditing = false;
          this.editingRoleId = null;
          this.showForm = false;
        },
        error: (err) => {
          this.error = 'Failed to update role';
        }
      });
    }
  }

  confirmDeleteRole(roleId: number): void {
    if (confirm('Are you sure you want to delete this role?')) {
      this.deleteRole(roleId);
    }
  }

  deleteRole(roleId: number): void {
    this.roleService.deleteRole(roleId).subscribe({
      next: () => {
        this.roles = this.roles.filter(role => role.id !== roleId);
      },
      error: (err) => {
        if (err.status === 200 || err.status === 204) {
          this.roles = this.roles.filter(role => role.id !== roleId);
        } else {
          this.error = 'Failed to delete role';
        }
      }
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadRoles();
  }
}