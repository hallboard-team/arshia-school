export interface LoggedInUser {
    token: string;
    normalizedEmail: string;
    userName: string;
    name: string;
    lastName: string;
    phoneNum: string;
    gender: string;
    roles: string[];
}