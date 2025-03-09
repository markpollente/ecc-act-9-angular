import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { EmployeeProfileComponent } from './employee-profile/employee-profile.component';
import { EmployeeListComponent } from './employee-list/employee-list.component';
import { TicketListComponent } from './ticket-list/ticket-list.component';
import { TicketDetailComponent } from './ticket-detail/ticket-detail.component';
import { RoleListComponent } from './role-list/role-list.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'profile', component: EmployeeProfileComponent, canActivate: [AuthGuard] },
  { path: 'employees', component: EmployeeListComponent, canActivate: [AuthGuard] },
  { path: 'tickets', component: TicketListComponent, canActivate: [AuthGuard] },
  { path: 'tickets/:id', component: TicketDetailComponent, canActivate: [AuthGuard] },
  { path: 'roles', component: RoleListComponent, canActivate: [AuthGuard] },
];