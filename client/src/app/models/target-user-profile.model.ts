import { EnrolledCourse, Photo } from "./helpers/enrolled-course.model";

export interface TargetUserProfile {
    email: string;
    userName: string;
    name: string;
    lastName: string;
    phoneNum?: string;
    gender: string;
    age: number;
    dateOfBirth: Date;
    photoUrl: string;
    enrolledCourses: EnrolledCourse[];
    memberPhoto: Photo
};