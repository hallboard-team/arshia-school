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
            Gender = adminInput.Gender.ToLower(),
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

    public static MemberDto ConvertAppUserToMemberDto(AppUser appUser, bool isAbsent)
    {
        return new MemberDto(
            Email: appUser.Email,
            UserName: appUser.NormalizedUserName!,
            Name: appUser.Name,
            LastName: appUser.LastName,
            PhoneNum: appUser.PhoneNum,
            Gender: appUser.Gender,
            Age: CustomDateTimeExtensions.CalculateAge(appUser.DateOfBirth),
            DateOfBirth: appUser.DateOfBirth,
            IsAbsent: isAbsent
        );
    }

    public static TargetMemberDto ConvertAppUserToTargetMemberDto(AppUser appUser)
    {
        return new TargetMemberDto(
            Email: appUser.Email,
            UserName: appUser.NormalizedUserName!,
            Name: appUser.Name,
            LastName: appUser.LastName,
            PhoneNum: appUser.PhoneNum,
            Gender: appUser.Gender,
            Age: CustomDateTimeExtensions.CalculateAge(appUser.DateOfBirth),
            DateOfBirth: appUser.DateOfBirth,
            EnrolledCourses: appUser.EnrolledCourses
        );
    }

    public static TeacherDto ConvertAppUserToTeacherDto(AppUser appUser)
    {
        return new TeacherDto(
            UserName: appUser.NormalizedUserName!,
            Name: appUser.Name,
            LastName: appUser.LastName,
            PhoneNum: appUser.PhoneNum,
            Gender: appUser.Gender
        );
    }

    public static ProfileDto ConvertAppUserToProfileDto(AppUser appUser)
    {
        return new ProfileDto(
            Email: appUser.Email,
            UserName: appUser.NormalizedUserName!,
            Name: appUser.Name,
            LastName: appUser.LastName,
            PhoneNum: appUser.PhoneNum,
            Gender: appUser.Gender,
            Age: CustomDateTimeExtensions.CalculateAge(appUser.DateOfBirth)
        );
    }

    public static UserWithRoleDto ConvertAppUserToUserWithRoleDto(AppUser appUser)
    {
        return new UserWithRoleDto(
            UserName: appUser.NormalizedUserName!,
            Roles: appUser.appRoles
        );
    }

    public static Attendence ConvertAddStudentStatusDtoToAttendence(AddStudentStatusDto teacherInput, ObjectId studentId, ObjectId courseId, DateOnly currentDate)
    {
        return new Attendence(
            StudentId: studentId,
            CourseId: courseId,
            Date: currentDate
        );
    }

    public static ShowStudentStatusDto ConvertAttendenceToShowStudentStatusDto(Attendence attendence)
    {
        return new ShowStudentStatusDto
        {
            Date = attendence.Date,
            CourseId = attendence.CourseId.ToString()
        };
    }

    public static Course ConvertAddCourseDtoToCourse(AddCourseDto managerInput, int daysCalc)
    {
        return new Course(
            Title: managerInput.Title.ToUpper(),
            ProfessorsIds: [],
            // ProfessorsNames: [],
            Tuition: managerInput.Tuition,
            Hours: managerInput.Hours,
            HoursPerClass: managerInput.HoursPerClass,
            Days: daysCalc,
            Start: managerInput.Start,
            IsStarted: "false"
        );
    }

    public static ShowCourseDto ConvertCourseToShowCourseDto(Course course)
    {
        return new ShowCourseDto
        {
            Id = course.Id.ToString(),
            Title = course.Title,
            // ProfessorNames = course.ProfessorsNames,
            Tuition = course.Tuition,
            Hours = course.Hours,
            HoursPerClass = course.HoursPerClass,
            Days = course.Days,
            Start = course.Start,
            IsStarted = course.IsStarted
        };
    }

    public static EnrolledCourse ConvertAddEnrolledCourseDtoToEnrolledCourse
        (AddEnrolledCourseDto managerInput, Course course,
            int paymentPerMonthCalc, int tuitionReminderCalc
        )
    {
        return new EnrolledCourse(
            // Id: Guid.NewGuid(),
            CourseId: course.Id,
            CourseTitle: course.Title.ToUpper(),
            CourseTuition: course.Tuition,
            NumberOfPayments: managerInput.NumberOfPayments,
            PaidNumber: 0,
            NumberOfPaymentsLeft: managerInput.NumberOfPayments,
            PaymentPerMonth: paymentPerMonthCalc,
            PaidAmount: managerInput.PaidAmount,
            TuitionRemainder: tuitionReminderCalc,
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