import { Routes } from '@angular/router';
import { LoginComponent } from './components/account/login/login.component';
import { RegisterComponent } from './components/account/register/register.component';
import { HomeComponent } from './components/home/home.component';
import { authGuard } from './guards/auth.guard';
import { authLoggedInGuard } from './guards/auth-logged-in.guard';
import { MemberListComponent } from './components/members/member-list/member-list.component';
import { AddDiscriptionComponent } from './components/add-discription/add-discription.component';
import { AdminComponent } from './components/admin/admin.component';
import { ManageerPannelComponent } from './components/manageer-pannel/manageer-pannel.component';
import { SecretaryComponent } from './components/secretary/secretary.component';
import { UserProfileComponent } from './components/user/user-profile/user-profile.component';
import { AboutUsComponent } from './components/about-us/about-us.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { TeacherComponent } from './components/teacher/teacher.component';
import { StudentCardComponent } from './components/students/student-card/student-card.component';
import { StudentListComponent } from './components/students/student-list/student-list.component';
import { DemoComponent } from './components/demo/demo.component';
import { CourseCardComponent } from './components/courses/course-card/course-card.component';
import { CourseListComponent } from './components/courses/course-list/course-list.component';
import { AttendenceListComponent } from './components/attendences/attendence-list/attendence-list.component';
import { AttendenceCardComponent } from './components/attendences/attendence-card/attendence-card.component';
import { CourseUpdateComponent } from './components/courses/course-update/course-update.component';
import { AddCourseComponent } from './components/courses/add-course/add-course.component';
import { MemberCardComponent } from './components/members/member-card/member-card.component';
import { EditMemberComponent } from './components/members/edit-member/edit-member.component';
import { EnrolledCourseComponent } from './components/enrolled-courses/enrolled-course/enrolled-course.component';
import { MemberEnrolledCourseComponent } from './components/enrolled-courses/member-enrolled-course/member-enrolled-course.component';
import { ContactUsComponent } from './components/contact-us/contact-us.component';
import { TargetUserProfileComponent } from './components/target-user-profile/target-user-profile.component';
import { TargetMemberEnrolledCourseComponent } from './components/enrolled-courses/target-member-enrolled-course/target-member-enrolled-course.component';
import { UploadPhotoComponent } from './components/enrolled-courses/upload-photo/upload-photo.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'home', component: HomeComponent },
    {
        path: '',
        runGuardsAndResolvers: 'always',
        canActivate: [authGuard],
        children: [
            { path: 'manager-panel', component: ManageerPannelComponent },
            { path: 'teacher-panel', component: TeacherComponent },
            { path: 'students-card/:courseTitle', component: StudentListComponent },
            { path: 'demo', component: DemoComponent },
            { path: 'profile', component: UserProfileComponent },
            { path: 'courses', component: CourseListComponent },
            { path: 'course-card', component: CourseCardComponent },
            { path: 'update-course/:courseTitle', component: CourseUpdateComponent },
            { path: 'add-course', component: AddCourseComponent },
            { path: 'attendences', component: AttendenceCardComponent },
            { path: 'attendences-card/:courseTitle', component: AttendenceListComponent },
            { path: 'members', component: MemberListComponent },
            { path: 'member-card', component: MemberCardComponent },
            { path: 'edit-member/:memberEmail', component: EditMemberComponent },
            { path: 'target-user-profile/:memberUserName', component: TargetUserProfileComponent },
            // { path: 'select-courses/:memberUserName', component: SelectCourseListComponent },
            // { path: 'select-course-card', component: SelectCourseCardComponent },
            // { path: 'select-courses/:memberUserName', component: SelectCourseListComponent },
            { path: 'enrolled-course/:memberUserName', component: EnrolledCourseComponent },
            { path: 'member-enrolled-course/:courseTitle', component: MemberEnrolledCourseComponent },
            { path: 'target-member-enrolled-course/:memberUserName/:courseTitle', component: TargetMemberEnrolledCourseComponent },
            { path: 'target-payment/:targetPaymentId', component: UploadPhotoComponent },
            // { path: 'منشی', component: SecretaryComponent },
            // { path: 'معلم', component: TeacherComponent },
            // { path: 'user/user-edit', component: UserEditComponent },
            { path: 'about', component: AboutUsComponent },
            { path: 'contact-us', component: ContactUsComponent },
            { path: 'not-found', component: NotFoundComponent }

            // { path: 'no-access', component: NoAccessComponent }
        ]
    },
    {
        path: '',
        runGuardsAndResolvers: 'always',
        canActivate: [authLoggedInGuard],
        children: [
            { path: 'account/login', component: LoginComponent },
            { path: 'account/register', component: RegisterComponent },
        ]
    }
    // { path: 'server-error', component: ServerErrorComponent },
    // { path: '**', component: NotFoundComponent, pathMatch: 'full' }
];
