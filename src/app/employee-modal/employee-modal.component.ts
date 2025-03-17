import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';

import { Employee } from '@models/employee.model';
import { Role } from '@models/role.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-employee-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './employee-modal.component.html',
  styleUrls: ['./employee-modal.component.scss']
})
export class EmployeeModalComponent {
  @Input() isEditing: boolean = false;
  @Input() newEmployee: Employee = {
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
  @Input() roles: Role[] = [];
  @Input() selectedRoleId: number | null = null;
  @Output() saveEmployee = new EventEmitter<{form: NgForm, selectedRoleId: number | null }>();

  onSave(form: NgForm): void {
    if (!form.valid) {
      return;
    }
    this.saveEmployee.emit({ form, selectedRoleId: this.selectedRoleId });
  }
}