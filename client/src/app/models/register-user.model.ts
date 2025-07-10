export interface RegisterUser {
    email: string;
    password: string;
    confirmPassword: string;
    phoneNum: string;
    dateOfBirth: string | undefined;
    name: string;
    lastName: string;
    gender: string;
}