import { EmployeeDto } from "./employee.dto";

export interface HelpdeskTicketDto {
    ticketNo: string;
    title: string;
    body: string;
    assignee?: EmployeeDto;
    status: string;
    remarks?: string;
  }