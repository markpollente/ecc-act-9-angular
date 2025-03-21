import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TicketService } from '@services/ticket.service';
import { AuthService } from '@services/auth.service';

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
    this.loadTicketCounts();
    this.loadPersonalCounts();
  }

  loadTicketCounts(): void {
    if (!this.authService.isAdmin()) return;
    
    this.loading = true;
    this.ticketService.getTicketCountsByStatus().subscribe({
      next: (counts) => {
        this.ticketCounts = counts;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load ticket statistics';
        this.loading = false;
        console.error('Error loading ticket counts:', err);
      }
    });
  }

  loadPersonalCounts(): void {
    this.loading = true;
    this.ticketService.getPersonalTicketCounts().subscribe({
      next: (counts) => {
        this.personalCounts = counts;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load personal ticket statistics';
        this.loading = false;
        console.error('Error loading personal ticket counts:', err);
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