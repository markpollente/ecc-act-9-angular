import { BaseModel } from "./base.model";
import { EmployeeRef } from "./employeeRef.model";

export interface Ticket extends BaseModel {
  ticketNo: string;
  title: string;
  body: string;
  assignee?: EmployeeRef;
  status: string;
  remarks?: string;
}