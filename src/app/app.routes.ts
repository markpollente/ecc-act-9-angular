import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { EmployeeProfileComponent } from './employee-profile/employee-profile.component';
import { EmployeeListComponent } from './employee-list/employee-list.component';
import { TicketListComponent } from './ticket-list/ticket-list.component';
import { TicketDetailComponent } from './ticket-detail/ticket-detail.component';
import { RoleListComponent } from './role-list/role-list.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'profile', component: EmployeeProfileComponent },
  { path: 'employees', component: EmployeeListComponent },
  { path: 'tickets', component: TicketListComponent },
  { path: 'tickets/:id', component: TicketDetailComponent },
  { path: 'roles', component: RoleListComponent },
];