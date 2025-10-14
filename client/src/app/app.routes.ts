import { Routes } from '@angular/router';
import { LoginComponent } from './components/account/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { authGuard } from './guards/auth.guard';
import { authLoggedInGuard } from './guards/auth-logged-in.guard';
import { MemberListComponent } from './components/members/member-list/member-list.component';
import { SecretaryComponent } from './components/secretary/secretary.component';
import { UserProfileComponent } from './components/user/user-profile/user-profile.component';
import { AboutUsComponent } from './components/about-us/about-us.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { TeacherComponent } from './components/teacher/teacher.component';
import { StudentListComponent } from './components/students/student-list/student-list.component';
import { AttendenceListComponent } from './components/attendences/attendence-list/attendence-list.component';
import { AttendenceCardComponent } from './components/attendences/attendence-card/attendence-card.component';
import { MemberCardComponent } from './components/members/member-card/member-card.component';
import { EnrolledCourseComponent } from './components/enrolled-courses/enrolled-course/enrolled-course.component';
import { MemberEnrolledCourseComponent } from './components/enrolled-courses/member-enrolled-course/member-enrolled-course.component';
import { ContactUsComponent } from './components/contact-us/contact-us.component';
import { TargetUserProfileComponent } from './components/target-user-profile/target-user-profile.component';
import { TargetMemberEnrolledCourseComponent } from './components/enrolled-courses/target-member-enrolled-course/target-member-enrolled-course.component';
import { UploadPhotoComponent } from './components/enrolled-courses/upload-photo/upload-photo.component';
import { managerGuard } from './guards/manager.guard';
import { secretaryGuard } from './guards/secretary.guard';
import { studentGuard } from './guards/student.guard';
import { teacherGuard } from './guards/teacher.guard';
import { RecoveryComponent } from './components/recovery/recovery.component';
import { ManagerPanelComponent } from './components/manager-panel/manager-panel.component';
import { CourseCreateComponent } from './components/courses/pages/create/course-create.component';
import { CourseCardComponent } from './components/courses/course-card/course-card.component';
import { CourseEditComponent } from './components/courses/pages/edit/course-edit.component';
import { CoursesListComponent } from './components/courses/pages/list/courses-list.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'home', component: HomeComponent },

    // Public Routes (no login required)
    { path: 'about', component: AboutUsComponent },
    { path: 'contact-us', component: ContactUsComponent },
    { path: 'courses', component: CoursesListComponent },
    { path: 'recovery', component: RecoveryComponent },

    // Authentication Required Routes
    {
        path: '',
        runGuardsAndResolvers: 'always',
        canActivate: [authGuard],
        children: [
            { path: 'profile', component: UserProfileComponent },

            // Manager-only
            { path: 'target-user-profile/:memberUserName', component: TargetUserProfileComponent, canActivate: [managerGuard] },
            { path: 'members', component: MemberListComponent, canActivate: [managerGuard] },
            { path: 'manager-panel', component: ManagerPanelComponent, canActivate: [managerGuard] },
            { path: 'add-course', component: CourseCreateComponent, canActivate: [managerGuard] },
            { path: 'update-course/:courseTitle', component: CourseEditComponent, canActivate: [managerGuard] },
            { path: 'target-member-enrolled-course/:memberUserName/:courseTitle', component: TargetMemberEnrolledCourseComponent, canActivate: [managerGuard] },
            { path: 'target-payment/:targetPaymentId', component: UploadPhotoComponent, canActivate: [managerGuard] },

            // Teacher-only
            { path: 'teacher-panel', component: TeacherComponent, canActivate: [teacherGuard] },


            // Secretary-only
            { path: 'secretary-panel', component: SecretaryComponent, canActivate: [secretaryGuard] },

            // Student-only
            { path: 'enrolled-course/:memberUserName', component: EnrolledCourseComponent, canActivate: [studentGuard] },

            // Shared (any authenticated user)
            { path: 'course-card', component: CourseCardComponent },
            { path: 'attendences', component: AttendenceCardComponent },
            { path: 'member-card', component: MemberCardComponent },
            { path: 'students-card/:courseTitle', component: StudentListComponent },
            { path: 'attendences-card/:courseTitle', component: AttendenceListComponent },
            { path: 'attendences-card/:memberUserName/:courseTitle', component: AttendenceListComponent, canActivate: [managerGuard] },
            // { path: 'edit-member/:memberEmail', component: EditMemberComponent },
            { path: 'member-enrolled-course/:courseTitle', component: MemberEnrolledCourseComponent },

            { path: 'not-found', component: NotFoundComponent }
        ]
    },

    {
        path: '',
        runGuardsAndResolvers: 'always',
        canActivate: [authLoggedInGuard],
        children: [
            { path: 'account/login', component: LoginComponent }
        ]
    },

    { path: '**', component: NotFoundComponent, pathMatch: 'full' }
];
