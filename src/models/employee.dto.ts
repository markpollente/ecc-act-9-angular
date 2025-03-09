import { RoleDto } from "./role.dto";
import { BaseDto } from "./base.dto";

export interface EmployeeDto extends BaseDto {
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