import { EmployeeDto } from "./employee.dto";
import { BaseDto } from "./base.dto";

export interface HelpdeskTicketDto extends BaseDto {
  ticketNo: string;
  title: string;
  body: string;
  assignee?: EmployeeDto;
  status: string;
  remarks?: string;
}