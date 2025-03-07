import { RoleDto } from "./role.dto";

export interface EmployeeDto {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  birthday?: string;
  age?: number;
  address?: string;
  contactNumber?: string;
  employmentStatus?: string;
  password?: string;
  roles?: RoleDto[];
}