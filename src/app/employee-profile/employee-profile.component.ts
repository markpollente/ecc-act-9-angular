import { Component, OnInit } from '@angular/core';
import { EmployeeService } from '../employee.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-employee-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './employee-profile.component.html',
  styleUrls: ['./employee-profile.component.scss']
})
export class EmployeeProfileComponent implements OnInit {
  profile: any;

  constructor(private employeeService: EmployeeService) { }

  ngOnInit(): void {
    this.employeeService.getProfile().subscribe(data => {
      this.profile = data;
    });
  }
}