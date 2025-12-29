import { Photo } from "./helpers/enrolled-course.model";

export interface UserProfile {
    email: string;
    userName: string;
    phoneNum: string;
    name: string;
    lastName: string;
    age: number;
    dateOfBirth: string;
    gender: string;
    photoUrl: string;
    photo: Photo;
}