import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { EmployeeService } from '@services/employee.service';

import { Ticket } from '@models/ticket.model';

@Component({
  selector: 'app-employee-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './employee-profile.component.html',
  styleUrls: ['./employee-profile.component.scss']
})
export class EmployeeProfileComponent implements OnInit {
  profile: any;
  filedTickets: Ticket[] = [];
  assignedTickets: Ticket[] = [];

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