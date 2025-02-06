export interface Course {
    // id: string;
    title: string;
    // List<ObjectId> ProfessorsIds, //132342344
    // int Tuition, //6_000_000t
    hours: number, //128h
    hoursPerClass: DoubleRange,
    days: number, // Cal in API
    start: Date, //TODO: Rename to StartOn //  1 mars 2025
    isStarted: boolean  
}

export interface AddCorse {
    userName: string;
    dars: string;
    tedadeKoleGhesdHa: number;
    shahriye: number;
}