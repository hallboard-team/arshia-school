import { PaginationParams } from "./paginationParams.model";

export class MemberParams extends PaginationParams {
  search: string = '';
  courseTitle: string = '';
  classTitle: string = '';
  minAge: number = 11;
  maxAge: number = 99;
}