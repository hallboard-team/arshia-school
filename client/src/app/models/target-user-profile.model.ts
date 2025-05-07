import { EnrolledCourse } from "./helpers/enrolled-course.model";

export interface TargetUserProfile{
    email: string;
    userName: string;
    name: string;
    lastName: string;
    phoneNum?: string;
    gender: string;
    age: number;
    enrolledCourses: EnrolledCourse[]
};