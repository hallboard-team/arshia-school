export interface RegisterMember {
    email: string;
    userName: string;
    password: string;
    confirmPassword: string;
    phoneNum: string;
    dateOfBirth: string | undefined;
}