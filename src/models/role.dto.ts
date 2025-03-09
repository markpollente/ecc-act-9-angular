import { BaseDto } from "./base.dto";

export interface RoleDto extends BaseDto {
  name: string;
  description?: string;
}