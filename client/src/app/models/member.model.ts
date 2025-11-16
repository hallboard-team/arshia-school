export interface Member {
    email: string;
    userName: string;
    name: string;
    lastName: string;
    phoneNum: string;
    gender: string;
    age: number;
    isAbsent: boolean;
    photo?: string | null;
}

export interface ShowMember {
    email: string;
    userName: string;
    currentPassword: string;
    password: string;
    confirmPasword: string;
}