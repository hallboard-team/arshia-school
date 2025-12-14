namespace api.DTOs;

public static class Mappers
{
    public static AppUser ConvertRegisterDtoToAppUser(RegisterDto adminInput)
    {
        return new AppUser
        {
            Email = adminInput.Email, // required by AspNet Identity
            UserName = Utils.GenerateComplexUsername(),
            DateOfBirth = adminInput.DateOfBirth,
            Name = adminInput.Name.Trim(),
            LastName = adminInput.LastName.Trim(),
            PhoneNum = adminInput.PhoneNum,
            Gender = adminInput.Gender,
        };
    }

    public static LoggedInDto ConvertAppUserToLoggedInDto(AppUser appUser, string tokenValue)
    {
        return new LoggedInDto
        {
            Token = tokenValue,
            UserName = appUser.NormalizedUserName,
            Email = appUser.NormalizedEmail,
            Name = appUser.Name,
            LastName = appUser.LastName,
            PhoneNum = appUser.PhoneNum,
            Gender = appUser.Gender
        };
    }

    public static RegisteredUserDto ConvertAppUserToRegisteredDto(AppUser appUser)
    {
        return new RegisteredUserDto
        {
            UserName = appUser.UserName,
            Email = appUser.Email,
            Name = appUser.Name,
            LastName = appUser.LastName,
            PhoneNum = appUser.PhoneNum,
            Gender = appUser.Gender,
            DateOfBirth = appUser.DateOfBirth
        };
    }

    public static MemberDto ConvertAppUserToMemberDto(AppUser appUser, bool isAbsent, Dictionary<ObjectId, string> roleIdToName)
    {
        List<string> roles = [.. appUser.Roles.Select(rId => roleIdToName.ContainsKey(rId) ? roleIdToName[rId] : string.Empty).Where(r => !string.IsNullOrEmpty(r))];

        return new MemberDto(
            Email: appUser.Email ?? string.Empty,
            UserName: appUser.NormalizedUserName ?? string.Empty,
            Name: appUser.Name ?? string.Empty,
            LastName: appUser.LastName ?? string.Empty,
            PhoneNum: appUser.PhoneNum,
            Gender: appUser.Gender,
            Age: CustomDateTimeExtensions.CalculateAge(appUser.DateOfBirth),
            DateOfBirth: appUser.DateOfBirth,
            IsAbsent: isAbsent,
            Photo: appUser.Photo,
            Roles: roles
        );
    }

    public static TargetMemberDto ConvertAppUserToTargetMemberDto(AppUser appUser)
    {
        return new TargetMemberDto(
            Email: appUser.Email ?? string.Empty,
            UserName: appUser.NormalizedUserName ?? string.Empty,
            Name: appUser.Name ?? string.Empty,
            LastName: appUser.LastName ?? string.Empty,
            PhoneNum: appUser.PhoneNum,
            Gender: appUser.Gender,
            Age: CustomDateTimeExtensions.CalculateAge(appUser.DateOfBirth),
            DateOfBirth: appUser.DateOfBirth,
            EnrolledCourses: appUser.EnrolledClasses,
            MemberPhoto: appUser.Photo
        );
    }

    public static TeacherDto ConvertAppUserToTeacherDto(AppUser appUser)
    {
        return new TeacherDto(
            UserName: appUser.NormalizedUserName!,
            Name: appUser.Name,
            LastName: appUser.LastName,
            PhoneNum: appUser.PhoneNum,
            Gender: appUser.Gender,
            Photo: appUser.Photo
        );
    }

    public static ProfileDto ConvertAppUserToProfileDto(AppUser appUser)
    {
        return new ProfileDto(
            Email: appUser.Email ?? string.Empty,
            UserName: appUser.NormalizedUserName ?? string.Empty,
            Name: appUser.Name ?? string.Empty,
            LastName: appUser.LastName ?? string.Empty,
            PhoneNum: appUser.PhoneNum,
            Gender: appUser.Gender,
            Age: CustomDateTimeExtensions.CalculateAge(appUser.DateOfBirth),
            Photo: appUser.Photo
        );
    }

    public static UserWithRoleDto ConvertAppUserToUserWithRoleDto(AppUser appUser)
    {
        return new UserWithRoleDto(
            UserName: appUser.NormalizedUserName!,
            Roles: appUser.AppRoles
        );
    }

    public static Attendance ConvertAddStudentStatusDtoToAttendence(AddStudentStatusDto teacherInput, ObjectId studentId, ObjectId courseId, DateOnly currentDate)
    {
        return new Attendance(
            StudentId: studentId,
            ClassId: courseId,
            Date: currentDate
        );
    }

    public static ShowStudentStatusDto ConvertAttendenceToShowStudentStatusDto(Attendance attendence)
    {
        return new ShowStudentStatusDto
        {
            Date = attendence.Date,
            CourseId = attendence.ClassId.ToString()
        };
    }

    public static Course ConvertAddCourseDtoToCourse(CreateCourseDto managerInput)
    {
        return new Course
        {
            Title = managerInput.Title.Trim().ToLower(),
            Description = managerInput.Description.Trim().ToLower(),
            TotalMinutes = managerInput.TotalMinutes,
            IsActive = managerInput.IsActive
        };

        // Title: managerInput.Title.ToUpper(),
        // ClassName: managerInput.ClassName.ToUpper(),
        // ProfessorsIds: [],
        // // ProfessorsNames: [],
        // Tuition: managerInput.Tuition,
        // TotalMinutes: (int)Math.Round(managerInput.Hours * 60d),
        // ClassMinutes: (int)Math.Round(managerInput.HoursPerClass * 60d),
        // Days: daysCalc,
        // Start: managerInput.Start,
        // IsStarted: false
    }

    public static ShowCourseDto ConvertCourseToShowCourseDto(Course course)
    {
        return new ShowCourseDto(
            Title: course.Title,
            Description: course.Description,
            TotalMinutes: course.TotalMinutes,
            IsActive: course.IsActive
        );

        // Id = course.Id.ToString(),
        // Title = course.Title,
        // ClassName = course.ClassName,
        // Tuition = course.Tuition,
        // // ProfessorNames = course.ProfessorsNames,
        // Hours = course.TotalMinutes / 60d,
        // HoursPerClass = course.ClassMinutes / 60d,
        // Days = course.Days,
        // Start = course.Start,
        // IsStarted = course.IsStarted,
        // ProfessorUserNames = new List<string>(),
        // ProfessorNames = new List<string>()
    }

    public static Site ConvertCreateSiteDtoToSite(CreateSiteDto request)
    {
        return new Site
        {
            Name = request.Name.ToLower().Trim(),
            Department = request.Department,
            Floor = request.Floor,
            Capacity = request.Capacity
        };
    }

    public static ShowSiteDto ConvertSiteToShowSiteDto(Site site)
    {
        return new ShowSiteDto(
            Name: site.Name,
            Department: site.Department,
            Floor: site.Floor,
            Capacity: site.Capacity
        );
    }

    public static Class ConvertCreateClassDtoToClass(CreateClassDto request, ObjectId? courseId, ObjectId siteId, int daysCalc)
    {
        return new Class
        {
            ClassName = request.ClassName.Trim().ToLower(),
            CourseId = courseId,
            SiteId = siteId,
            ProfessorsIds = [],
            Tuition = request.Tuition,
            ClassMinutes = (int)Math.Round(request.ClassMinutes * 60d),
            Days = daysCalc,
            StartDate = request.StartDate,
            EndedDate = request.EndedDate,
            IsStarted = request.IsStarted,
            IsActive = request.IsActive
        };
    }

    public static ShowClassDto ConvertClassToShowClassDto(Class model, ShowCourseDto course, ShowSiteDto site, List<string> userNames, List<string> names)
    {
        return new ShowClassDto(
            ClassName: model.ClassName,
            Course: course,
            Site: site,
            ProfessorUserNames: userNames,
            ProfessorNames: names,
            Tuition: model.Tuition,
            ClassMinutes: model.ClassMinutes,
            Days: model.Days,
            StartDate: model.StartDate,
            EndedDate: model.EndedDate,
            IsStarted: model.IsStarted,
            IsEnded: model.IsEnded,
            IsActive: model.IsActive
        );
    }

    // public static ShowCourseDto ConvertCourseToCourseRes(Course course, List<string> userNames, List<string> names)
    // {
    //     return new CourseResponse
    //     {
    //         Id = course.Id.ToString(),
    //         Title = course.Title,
    //         ClassName = course.ClassName,
    //         ProfessorUserNames = userNames,
    //         ProfessorNames = names,
    //         Tuition = course.Tuition,
    //         TotalMinutes = course.TotalMinutes,
    //         ClassMinutes = course.ClassMinutes,
    //         Days = course.Days,
    //         Start = course.Start,
    //         IsStarted = course.IsStarted
    //     };
    // }

    public static EnrolledClass ConvertAddEnrolledCourseDtoToEnrolledCourse
        (AddEnrolledCourseDto managerInput, Class model,
            int paymentPerMonthCalc, int lastPaymentPerMonthCalc,
            int tuitionReminderCalc
        )
    {
        return new EnrolledClass(
            // Id: Guid.NewGuid(),
            ClassId: model.Id,
            NumberOfPayments: managerInput.NumberOfPayments,
            PaidNumber: 0,
            NumberOfPaymentsLeft: managerInput.NumberOfPayments,
            PaymentPerMonth: paymentPerMonthCalc,
            PaidAmount: managerInput.PaidAmount,
            TuitionRemainder: tuitionReminderCalc,
            LastPaymentPerMonth: lastPaymentPerMonthCalc,
            Payments: []
        );
    }

    public static Photo ConvertPhotoUrlsToPhoto(string[] photoUrls, bool isMain)
    {
        return new Photo(
            Url_165: photoUrls[0],
            Url_256: photoUrls[1],
            Url_enlarged: photoUrls[2],
            IsMain: isMain
        );
    }

    public static MemberPhoto ConvertPhotoUrlsToMemberPhoto(string[] photoUrls)
    {
        return new MemberPhoto(
            Url_165: photoUrls[0],
            Url_256: photoUrls[1],
            Url_enlarged: photoUrls[2]
        );
    }

    public static class Utils
    {
        private static readonly Random _random = new();

        public static string GenerateComplexUsername(int length = 8)
        {
            const string chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            return new string(Enumerable.Repeat(chars, length)
                .Select(s => s[_random.Next(s.Length)]).ToArray());
        }
    }
}