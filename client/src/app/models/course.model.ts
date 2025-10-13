export interface Course {
    title: string,
    professorUserNames: string[],
    tuition: number,
    hours: number,
    hoursPerClass: DoubleRange,
    days: number,
    start: string | undefined,
    isStarted: string
}

export interface ShowCourse {
    title: string,
    professorNames: string[],
    tuition: number,
    hours: number,
    hoursPerClass: DoubleRange,
    days: number,
    start: string | undefined,
    isStarted: string
}

export interface CourseUpdate {
    title: string,
    tuition: number,
    hours: number,
    hoursPerClass: DoubleRange,
    start: string | undefined,
    isStarted: boolean
}

export interface AddCourse {
    title: string,
    tuition: number,
    hours: number,
    hoursPerClass: number,
    start: string | undefined
}