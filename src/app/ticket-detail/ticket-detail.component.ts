import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HelpdeskTicketService } from '../ticket.service';
import { HelpdeskTicketDto } from '../../models/helpdesk-ticket.dto';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ticket-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ticket-detail.component.html',
  styleUrls: ['./ticket-detail.component.scss']
})
export class TicketDetailComponent implements OnInit {
  ticket: HelpdeskTicketDto | null = null;
  loading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private ticketService: HelpdeskTicketService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.ticketService.getTicketById(+id).subscribe({
        next: (data) => {
          this.ticket = data;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load ticket details';
          this.loading = false;
        }
      });
    }
  }
}