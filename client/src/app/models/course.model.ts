export interface Course {
    title: string,
    className: string,
    professorUserNames: string[],
    professorNames: string[],
    tuition: number,
    hours?: number,
    hoursPerClass?: number,
    totalMinutes?: number;
    classMinutes?: number;
    days: number,
    start: string | undefined,
    isStarted: boolean
}

export interface ShowCourse {
    title: string,
    className: string,
    professorNames: string[],
    tuition: number,
    hours: number,
    hoursPerClass: number,
    days: number,
    start: string | undefined,
    isStarted: boolean
}

export interface CourseUpdate {
    title: string,
    className: string,
    tuition: number,
    hours: number,
    hoursPerClass: number,
    start: string | undefined,
    isStarted: boolean
}

export interface AddCourse {
    title: string,
    className: string,
    tuition: number,
    hours: number,
    hoursPerClass: number,
    start: string | undefined
}