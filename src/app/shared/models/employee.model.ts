import { Role } from "./role.model";
import { BaseModel } from "./base.model";

export interface Employee extends BaseModel {
  firstName: string;
  lastName: string;
  email: string;
  birthday?: string;
  age?: number;
  address?: string;
  contactNumber?: string;
  employmentStatus?: string;
  password?: string;
  roles?: Role[];
}