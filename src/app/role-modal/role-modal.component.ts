import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Role } from '@shared/models/role.model';

@Component({
  selector: 'app-role-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './role-modal.component.html',
  styleUrl: './role-modal.component.scss'
})
export class RoleModalComponent {
  @Input() isEditing: boolean = false;
  @Input() newRole: Role = {
    name: '',
    description: ''
  };
  @Output() saveRole = new EventEmitter<NgForm>();

  onSave(form: NgForm): void {
    this.saveRole.emit(form);
  }

}