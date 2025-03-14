import { Employee } from "./employee.model";
import { BaseModel } from "./base.model";

export interface Ticket extends BaseModel {
  ticketNo: string;
  title: string;
  body: string;
  assignee?: Employee;
  status: string;
  remarks?: string;
}