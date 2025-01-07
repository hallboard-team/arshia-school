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
import { TeacherComponent } from './components/teacher/teacher.component';
import { UserProfileComponent } from './components/user/user-profile/user-profile.component';
import { UserEditComponent } from './components/user/user-edit/user-edit.component';
// import { MessagesComponent } from './components/messages/messages.component';
// import { NoAccessComponent } from './components/errors/no-access/no-access.component';
// import { NotFoundComponent } from './components/errors/not-found/not-found.component';
// import { ServerErrorComponent } from './components/errors/server-error/server-error.component';
// import { MemberListComponent } from './components/members/member-list/member-list.component';
// import { MemberCardComponent } from './components/members/member-card/member-card.component';
// import { MemberDetailsComponent } from './components/members/member-details/member-details.component';
// import { UserEditComponent } from './components/user/user-edit/user-edit.component';
// import { FriendsComponent } from './components/friends/friends.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'home', component: HomeComponent },
    {
        path: '',
        runGuardsAndResolvers: 'always', 
        canActivate: [authGuard],
        children: [
            { path: 'کاربران سپنتا', component: MemberListComponent },
            { path: 'ادمین', component: AdminComponent },
            { path: 'پروفایل', component: UserProfileComponent },
            { path: 'add-discription', component: AddDiscriptionComponent },
            { path: 'مدیر', component: ManageerPannelComponent },
            { path: 'منشی', component: SecretaryComponent },
            { path: 'معلم', component: TeacherComponent },
            { path: 'user/user-edit', component: UserEditComponent },

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
