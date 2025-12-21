export interface CourseBase {
    title: string;
    description: string;
    totalMinutes: number;
    isActive: boolean;
}

export interface ShowCourse extends CourseBase {}

export interface AddCourse extends CourseBase {}

export interface CourseUpdate extends CourseBase {}

export interface Course extends CourseBase {
    id?: string; 
}