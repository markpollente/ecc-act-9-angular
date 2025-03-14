import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { EmployeeDto } from '../../models/employee.dto';
import { RoleDto } from '../../models/role.dto';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-employee-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './employee-modal.component.html',
  styleUrls: ['./employee-modal.component.scss']
})
export class EmployeeModalComponent {
  @Input() isEditing: boolean = false;
  @Input() newEmployee: EmployeeDto = {
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
  @Input() roles: RoleDto[] = [];
  @Input() selectedRoleId: number | null = null;
  @Output() saveEmployee = new EventEmitter<NgForm>();

  onSave(form: NgForm): void {
    this.saveEmployee.emit(form);
  }
}