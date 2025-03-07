// enrolled-course.model.ts
export interface EnrolledCourse {
    // courseId: string;
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
    photo: Photo | null;  // Assuming Photo is another object
}
  
export interface Photo {
    url_165: string;
    url_256: string;
    url_enlarged: string;
}