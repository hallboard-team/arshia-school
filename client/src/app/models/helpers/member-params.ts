import { PaginationParams } from "./paginationParams.model";

export class MemberParams extends PaginationParams {
    search: string = '';
    minAge: number = 18;
    maxAge: number = 99;
  }