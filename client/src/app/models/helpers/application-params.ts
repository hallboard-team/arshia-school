export class PaginationParams {
    pageNumber = 1;
    pageSize = 5;
}

export class CourseParams extends PaginationParams {}

export class SiteParams extends PaginationParams {}

export class ClassParams extends PaginationParams {}