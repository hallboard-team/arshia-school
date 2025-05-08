export interface UpdateEnrolledCourse {
    titleCourse: string,
    paidAmount: number,
    method: PaymentMethod
}

export enum PaymentMethod {
    KartBeKart,
    Naghdi,
    PozDevice
}