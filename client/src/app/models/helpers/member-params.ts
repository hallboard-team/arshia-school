import { PaginationParams } from "./paginationParams.model";

export class MemberParams extends PaginationParams {
  search: string = '';
  courseTitle: string = '';
  className: string = '';
  roles: string[] = ['student']
  minAge: number = 11;
  maxAge: number = 99;
}