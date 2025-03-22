import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TicketService } from '@services/ticket.service';
import { AuthService } from '@services/auth.service';
import { forkJoin, of } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  ticketCounts: {[key: string]: number} = {};
  personalCounts: {[key: string]: number} = {};
  loading = true;
  error: string | null = null;
  isAdmin = false;

  constructor(
    private ticketService: TicketService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.hasRole('ADMIN');
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    
    const adminCountsObservable = this.isAdmin ? 
      this.ticketService.getTicketCountsByStatus() : 
      of({});
      
    forkJoin({
      adminCounts: adminCountsObservable,
      personalCounts: this.ticketService.getPersonalTicketCounts()
    }).subscribe({
      next: (results) => {
        this.ticketCounts = results.adminCounts;
        this.personalCounts = results.personalCounts;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load dashboard statistics';
        this.loading = false;
        console.error('Error loading dashboard data:', err);
      }
    });
  }

  getTotalPersonalAssigned(): number {
    return (this.personalCounts['ASSIGNED_FILED'] || 0) + 
           (this.personalCounts['ASSIGNED_INPROGRESS'] || 0) + 
           (this.personalCounts['ASSIGNED_DRAFT'] || 0);
  }

  getTotalPersonalCreated(): number {
    return (this.personalCounts['CREATED_FILED'] || 0) + 
           (this.personalCounts['CREATED_INPROGRESS'] || 0) + 
           (this.personalCounts['CREATED_DRAFT'] || 0);
  }
}