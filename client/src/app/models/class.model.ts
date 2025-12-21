import { ShowCourse } from "./course.model"; 
import { ShowSite } from "./site.model";     

export interface ClassBase {
  classRoomName: string;
  tuition: number;
  classRoomMinutes: number;
  days?: number; 
  startDate: string;
  endedDate: string;
  isStarted: boolean;
  isEnded: boolean;
  isActive: boolean;
}

export interface ShowClass extends ClassBase {
  id: string;
  course: ShowCourse;
  site: ShowSite;    
  professorUserNames: string[];
  professorNames: string[];
}

export interface AddClass {
  classRoomName: string;
  courseName: string;
  siteName: string;
  classRoomMinutes: number;
  tuition: number;
  startDate: string;
  endedDate: string;
}

export interface ClassUpdate extends ClassBase {}