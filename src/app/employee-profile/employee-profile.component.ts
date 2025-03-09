import { Component, OnInit } from '@angular/core';
import { EmployeeService } from '../employee.service';
import { CommonModule } from '@angular/common';
import { HelpdeskTicketDto } from '../../models/helpdesk-ticket.dto';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-employee-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './employee-profile.component.html',
  styleUrls: ['./employee-profile.component.scss']
})
export class EmployeeProfileComponent implements OnInit {
  profile: any;
  filedTickets: HelpdeskTicketDto[] = [];
  assignedTickets: HelpdeskTicketDto[] = [];

  constructor(private employeeService: EmployeeService) { }

  ngOnInit(): void {
    this.employeeService.getProfile().subscribe(data => {
      this.profile = data;
    });

    this.employeeService.getFiledTickets().subscribe(data => {
      this.filedTickets = data;
    });

    this.employeeService.getAssignedTickets().subscribe(data => {
      this.assignedTickets = data;
    });
  }
}