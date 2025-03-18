import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';

import { Employee } from '@models/employee.model';
import { Ticket } from '@models/ticket.model';

@Component({
  selector: 'app-ticket-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './ticket-modal.component.html',
  styleUrl: './ticket-modal.component.scss'
})
export class TicketModalComponent {
  @Input() isEditing: boolean = false;
  @Input() newTicket: Ticket = {
    ticketNo: '',
    title: '',
    body: '',
    status: '',
    remarks: '',
    createdDate: '',
    updatedDate: '',
    createdBy: '',
    updatedBy: ''
  };
  @Input() employees: Employee[] = [];
  @Input() selectedEmployeeId: number | null = null;
  @Output() saveTicket = new EventEmitter<{form: NgForm, selectedEmployeeId: number | null }>();

  ticketStatuses: string[] = ['FILED', 'DRAFT', 'INPROGRESS', 'DUPLICATE', 'CLOSED'];

  onSave(form: NgForm): void {
    if (!form.valid) {
      return;
    }
    this.saveTicket.emit({form, selectedEmployeeId: this.selectedEmployeeId });
  }

}