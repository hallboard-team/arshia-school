export interface ShowCourse {
    title: string;
    description: string;
    totalMinutes: number; 
    isActive: boolean;   
}

export interface AddCourse {
    title: string;
    description: string;
    totalMinutes: number;
    isActive: boolean;
}

export interface CourseUpdate {
    title: string;
    description: string;
    totalMinutes: number;
    isActive: boolean;
}

export interface Course {
    id?: string; 
    title: string;
    description: string;
    totalMinutes: number;
    isActive: boolean;
}