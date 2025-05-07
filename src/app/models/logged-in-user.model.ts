import { AddCorse } from "./add-corse.model";

export interface LoggedInUser {
    token: string;
    normalizedEmail: string;
    userName: string;
    name: string;
    lastName: string;
    phoneNum: string;
    gender: string;
    corses: AddCorse[];
    roles: string[];
}