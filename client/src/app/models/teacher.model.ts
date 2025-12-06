import { Photo } from "./helpers/enrolled-course.model";

export interface Teacher {
    userName: string;
    name: string;
    lastName: string;
    phoneNum: number;
    gender: string;
    photo: Photo;
}