export interface Course {
    // id: string;
    title: string,
    // professorNames: string[],
    tuition: number,
    hours: number, 
    hoursPerClass: DoubleRange,
    // hoursePerClass: number,
    days: number,
    start: Date,
    isStarted: string  
}

export interface ShowCourse {
    // id: string;
    title: string,
    professorNames: string[],
    tuition: number,
    hours: number, 
    hoursPerClass: DoubleRange,
    // hoursePerClass: number,
    days: number,
    start: Date,
    isStarted: string  
}

export interface CourseUpdate {
    title: string,
    // professorUserName: string,
    tuition: number,
    hours: number, 
    hoursPerClass: DoubleRange,
    start: Date,
    isStarted: boolean  
}

export interface AddCourse {
    title: string,
    tuition: number,
    hourse: number,
    hoursePerClass: number,
    start: Date
}