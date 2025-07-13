export interface EnrolledCourse {
    courseTitle: string;
    courseTuition: number;
    numberOfPayments: number;
    paidNumber: number;
    numberOfPaymentsLeft: number;
    paymentPerMonth: number;
    paidAmount: number;
    tuitionRemainder: number;
    payments: Payment[];
}

export interface Payment {
    id: string;
    amount: number;
    paidOn: string;
    method: string;
    photo: Photo | null;
}

export interface Photo {
    url_165: string;
    url_256: string;
    url_enlarged: string;
}