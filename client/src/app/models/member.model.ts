import { Photo } from "./helpers/enrolled-course.model";

export interface Member {
    email: string;
    userName: string;
    name: string;
    lastName: string;
    phoneNum: string;
    gender: string;
    age: number;
    isAbsent: boolean;
    photo: Photo;
    roles: string[];
}

export interface ShowMember {
    email: string;
    userName: string;
    currentPassword: string;
    password: string;
    confirmPasword: string;
}