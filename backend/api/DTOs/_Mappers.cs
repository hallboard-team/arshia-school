namespace api.DTOs;

public static class Mappers
{
    public static AppUser ConvertRegisterDtoToAppUser(RegisterDto userInput) =>
        new()
        {
            Email = userInput.Email, // required by AspNet Identity
            UserName = Utils.GenerateComplexUsername(),
            DateOfBirth = userInput.DateOfBirth,
            Name = userInput.Name.Trim(),
            LastName = userInput.LastName.Trim(),
            PhoneNum = userInput.PhoneNum,
            Gender = userInput.Gender,
        };

    public static LoggedInDto ConvertAppUserToLoggedInDto(AppUser appUser, string tokenValue) =>
         new()
         {
             Token = tokenValue,
             UserName = appUser.NormalizedUserName,
             Email = appUser.NormalizedEmail,
             Name = appUser.Name,
             LastName = appUser.LastName,
             PhoneNum = appUser.PhoneNum,
             Gender = appUser.Gender
         };

    public static RegisteredUserDto ConvertAppUserToRegisteredDto(AppUser appUser) =>
         new()
         {
             UserName = appUser.UserName,
             Email = appUser.Email,
             Name = appUser.Name,
             LastName = appUser.LastName,
             PhoneNum = appUser.PhoneNum,
             Gender = appUser.Gender,
             DateOfBirth = appUser.DateOfBirth
         };

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

    public static TargetMemberDto ConvertAppUserToTargetMemberDto(AppUser appUser) =>
         new(
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

    public static TeacherDto ConvertAppUserToTeacherDto(AppUser appUser) =>
         new(
            UserName: appUser.NormalizedUserName!,
            Name: appUser.Name,
            LastName: appUser.LastName,
            PhoneNum: appUser.PhoneNum,
            Gender: appUser.Gender,
            Photo: appUser.Photo
        );

    public static ProfileDto ConvertAppUserToProfileDto(AppUser appUser) =>
         new(
            Email: appUser.Email ?? string.Empty,
            UserName: appUser.NormalizedUserName ?? string.Empty,
            Name: appUser.Name ?? string.Empty,
            LastName: appUser.LastName ?? string.Empty,
            PhoneNum: appUser.PhoneNum,
            Gender: appUser.Gender,
            Age: CustomDateTimeExtensions.CalculateAge(appUser.DateOfBirth),
            Photo: appUser.Photo
        );

    public static UserWithRoleDto ConvertAppUserToUserWithRoleDto(AppUser appUser) =>
         new(
            UserName: appUser.NormalizedUserName!,
            Roles: appUser.AppRoles
        );

    public static Attendance ConvertAddStudentStatusDtoToAttendence(AddStudentStatusDto teacherInput, ObjectId studentId, ObjectId courseId, DateOnly currentDate) =>
         new(
            StudentId: studentId,
            ClassId: courseId,
            Date: currentDate
        );

    public static ShowStudentStatusDto ConvertAttendanceToShowStudentStatusDto(Attendance attendence) =>
         new()
         {
             Date = attendence.Date,
             CourseId = attendence.ClassId.ToString()
         };

    public static Course ConvertAddCourseDtoToCourse(CreateCourseDto managerInput) =>
         new()
         {
             Title = managerInput.Title.Trim().ToLower(),
             Description = managerInput.Description.Trim().ToLower(),
             TotalMinutes = managerInput.TotalHours,
             IsActive = managerInput.IsActive
         };

    public static ShowCourseDto ConvertCourseToShowCourseDto(Course course) =>
         new(
            Title: course.Title,
            Description: course.Description,
            TotalMinutes: course.TotalMinutes,
            IsActive: course.IsActive
        );

    public static Site ConvertCreateSiteDtoToSite(CreateSiteDto request) =>
         new()
         {
             Name = request.Name.ToLower().Trim(),
             Department = request.Department,
             Floor = request.Floor,
             Capacity = request.Capacity
         };

    public static ShowSiteDto ConvertSiteToShowSiteDto(Site site) =>
        new(
            Name: site.Name,
            Department: site.Department,
            Floor: site.Floor,
            Capacity: site.Capacity
        );

    public static ClassRoom ConvertCreateClassRoomDtoToClassRoom(CreateClassRoomDto request, ObjectId? courseId, ObjectId siteId, int daysCalc) =>
         new()
         {
             ClassRoomName = request.ClassRoomName.Trim().ToLower(),
             CourseId = courseId,
             SiteId = siteId,
             ProfessorsIds = [],
             Tuition = request.Tuition,
             ClassRoomMinutes = (int)Math.Round(request.ClassRoomMinutes * 60d),
             Days = daysCalc,
             StartDate = request.StartDate,
             EndedDate = request.EndedDate,
             IsStarted = request.IsStarted,
             IsActive = request.IsActive
         };

    public static ShowClassRoomDto ConvertClassRoomToShowClassRoomDto(ClassRoom model, ShowCourseDto course, ShowSiteDto site, List<string> userNames, List<string> names) =>
         new(
            ClassRoomName: model.ClassRoomName,
            Course: course,
            Site: site,
            ProfessorUserNames: [.. userNames],
            ProfessorNames: [.. names],
            Tuition: model.Tuition,
            ClassRoomMinutes: model.ClassRoomMinutes,
            Days: model.Days,
            StartDate: model.StartDate,
            EndedDate: model.EndedDate,
            IsStarted: model.IsStarted,
            IsEnded: model.IsEnded,
            IsActive: model.IsActive
        );

    public static EnrolledClassRoom ConvertAddEnrolledCourseDtoToEnrolledCourse
        (AddEnrolledCourseDto managerInput, ClassRoom model,
            int paymentPerMonthCalc, int lastPaymentPerMonthCalc,
            int tuitionReminderCalc
        ) =>
         new(
            // Id: Guid.NewGuid(),
            ClassRoomId: model.Id,
            NumberOfPayments: managerInput.NumberOfPayments,
            PaidNumber: 0,
            NumberOfPaymentsLeft: managerInput.NumberOfPayments,
            PaymentPerMonth: paymentPerMonthCalc,
            PaidAmount: managerInput.PaidAmount,
            TuitionRemainder: tuitionReminderCalc,
            LastPaymentPerMonth: lastPaymentPerMonthCalc,
            Payments: []
        );

    public static Photo ConvertPhotoUrlsToPhoto(string[] photoUrls, bool isMain) =>
         new(
            Url_165: photoUrls[0],
            Url_256: photoUrls[1],
            Url_enlarged: photoUrls[2],
            IsMain: isMain
        );

    public static MemberPhoto ConvertPhotoUrlsToMemberPhoto(string[] photoUrls) =>
         new(
            Url_165: photoUrls[0],
            Url_256: photoUrls[1],
            Url_enlarged: photoUrls[2]
        );

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