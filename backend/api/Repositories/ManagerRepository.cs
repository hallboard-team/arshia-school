using static api.DTOs.Mappers;

namespace api.Repositories;

public class ManagerRepository : IManagerRepository
{
    #region Vars and Constructor 
    private readonly IMongoCollection<AppUser>? _collectionAppUser;
    private readonly IMongoCollection<Course>? _collectionCourse;
    private readonly IMongoCollection<Attendence>? _collectionAttendence;
    private readonly UserManager<AppUser> _userManager;
    private readonly ITokenService _tokenService;
    private readonly IMongoClient _client; // used for Session
    private readonly IPhotoService _photoService;

    public ManagerRepository(
        IMongoClient client, ITokenService tokenService,
        IMyMongoDbSettings dbSettings, UserManager<AppUser> userManager,
        IPhotoService photoService)
    {
        _client = client; // used for Session
        var database = client.GetDatabase(dbSettings.DatabaseName);
        _collectionAppUser = database.GetCollection<AppUser>(AppVariablesExtensions.collectionUsers);
        _collectionCourse = database.GetCollection<Course>(AppVariablesExtensions.collectionCourses);
        _collectionAttendence = database.GetCollection<Attendence>(AppVariablesExtensions.collectionAttendences);

        _userManager = userManager;
        _tokenService = tokenService;
        _photoService = photoService;
    }
    #endregion Vars and Constructor

    private IMongoQueryable<AppUser> CreateQuery(MemberParams memberParams)
    {
        DateOnly minDob = DateOnly.FromDateTime(DateTime.Today.AddYears(-memberParams.MaxAge - 1));
        DateOnly maxDob = DateOnly.FromDateTime(DateTime.Today.AddYears(-memberParams.MinAge));

        IMongoQueryable<AppUser> query = _collectionAppUser.AsQueryable();

        if (!string.IsNullOrEmpty(memberParams.Search))
        {
            memberParams.Search = memberParams.Search.ToUpper();

            query = query.Where(u =>
            u.Name.ToUpper().Contains(memberParams.Search)
            || u.NormalizedUserName.Contains(memberParams.Search.ToUpper())
            || u.LastName.ToUpper().Contains(memberParams.Search));
        }

        query = query.Where(u => !(u.NormalizedUserName!.Equals("ADMIN") || u.NormalizedUserName == "MANAGER"));
        query = query.Where(u => u.Id != memberParams.UserId);
        query = query.Where(u => u.DateOfBirth >= minDob && u.DateOfBirth <= maxDob);

        return query;
    }

    private async Task<string> GenerateUniqueUsernameAsync(CancellationToken cancellationToken)
    {
        string newUserName;
        bool exists;

        do
        {
            newUserName = Utils.GenerateComplexUsername(8);
            exists = await _collectionAppUser
                .Find(u => u.UserName == newUserName)
                .AnyAsync(cancellationToken);
        }
        while (exists);

        return newUserName;
    }

    public async Task<LoggedInDto?> CreateSecretaryAsync(RegisterDto registerDto, CancellationToken cancellationToken)
    {
        LoggedInDto loggedInDto = new();

        bool doasePhoneNumEixst = await _collectionAppUser
            .Find<AppUser>(doc => doc.PhoneNum == registerDto.PhoneNum)
            .AnyAsync(cancellationToken);

        if (doasePhoneNumEixst)
        {
            loggedInDto.Errors.Add("شماره تلفن وارد شده قبلاً ثبت شده است.");
            return loggedInDto;
        }

        string uniqueUsername = await GenerateUniqueUsernameAsync(cancellationToken);

        AppUser appUser = new AppUser
        {
            Email = registerDto.Email,
            UserName = uniqueUsername,
            DateOfBirth = registerDto.DateOfBirth,
            Name = registerDto.Name.Trim(),
            LastName = registerDto.LastName.Trim(),
            PhoneNum = registerDto.PhoneNum,
            Gender = registerDto.Gender.ToLower()
        };

        IdentityResult? userCreatedResult = await _userManager.CreateAsync(appUser, registerDto.Password);

        if (userCreatedResult.Succeeded)
        {
            IdentityResult? roleResult = await _userManager.AddToRoleAsync(appUser, "secretary");

            if (!roleResult.Succeeded)
                return loggedInDto;

            string? token = await _tokenService.CreateToken(appUser, cancellationToken);

            if (!string.IsNullOrEmpty(token))
            {
                return Mappers.ConvertAppUserToLoggedInDto(appUser, token);
            }
        }
        else
        {
            foreach (IdentityError error in userCreatedResult.Errors)
            {
                loggedInDto.Errors.Add(error.Description);
            }
        }

        return loggedInDto;
    }

    public async Task<LoggedInDto?> CreateStudentAsync(RegisterDto registerDto, CancellationToken cancellationToken)
    {
        LoggedInDto loggedInDto = new();

        bool doasePhoneNumEixst = await _collectionAppUser
            .Find<AppUser>(doc => doc.PhoneNum == registerDto.PhoneNum)
            .AnyAsync(cancellationToken);

        if (doasePhoneNumEixst)
        {
            loggedInDto.Errors.Add("شماره تلفن وارد شده قبلاً ثبت شده است.");
            return loggedInDto;
        }

        string uniqueUsername = await GenerateUniqueUsernameAsync(cancellationToken);

        AppUser appUser = new AppUser
        {
            Email = registerDto.Email,
            UserName = uniqueUsername,
            DateOfBirth = registerDto.DateOfBirth,
            Name = registerDto.Name.Trim(),
            LastName = registerDto.LastName.Trim(),
            PhoneNum = registerDto.PhoneNum,
            Gender = registerDto.Gender.ToLower()
        };

        IdentityResult? userCreatedResult = await _userManager.CreateAsync(appUser, registerDto.Password);

        if (userCreatedResult.Succeeded)
        {
            IdentityResult? roleResult = await _userManager.AddToRoleAsync(appUser, "student");

            if (!roleResult.Succeeded)
                return loggedInDto;

            string? token = await _tokenService.CreateToken(appUser, cancellationToken);

            if (!string.IsNullOrEmpty(token))
            {
                return Mappers.ConvertAppUserToLoggedInDto(appUser, token);
            }
        }
        else
        {
            foreach (IdentityError error in userCreatedResult.Errors)
            {
                loggedInDto.Errors.Add(error.Description);
            }
        }

        return loggedInDto;
    }

    public async Task<LoggedInDto?> CreateTeacherAsync(RegisterDto registerDto, CancellationToken cancellationToken)
    {
        LoggedInDto loggedInDto = new();

        bool doasePhoneNumEixst = await _collectionAppUser
            .Find<AppUser>(doc => doc.PhoneNum == registerDto.PhoneNum)
            .AnyAsync(cancellationToken);

        if (doasePhoneNumEixst)
        {
            loggedInDto.Errors.Add("شماره تلفن وارد شده قبلاً ثبت شده است.");
            return loggedInDto;
        }

        string uniqueUsername = await GenerateUniqueUsernameAsync(cancellationToken);

        AppUser appUser = new AppUser
        {
            Email = registerDto.Email,
            UserName = uniqueUsername,
            DateOfBirth = registerDto.DateOfBirth,
            Name = registerDto.Name.Trim(),
            LastName = registerDto.LastName.Trim(),
            PhoneNum = registerDto.PhoneNum,
            Gender = registerDto.Gender.ToLower()
        };

        IdentityResult? userCreatedResult = await _userManager.CreateAsync(appUser, registerDto.Password);

        if (userCreatedResult.Succeeded)
        {
            IdentityResult? roleResult = await _userManager.AddToRoleAsync(appUser, "teacher");

            if (!roleResult.Succeeded)
                return loggedInDto;

            string? token = await _tokenService.CreateToken(appUser, cancellationToken);

            if (!string.IsNullOrEmpty(token))
            {
                return Mappers.ConvertAppUserToLoggedInDto(appUser, token);
            }
        }
        else
        {
            foreach (IdentityError error in userCreatedResult.Errors)
            {
                loggedInDto.Errors.Add(error.Description);
            }
        }

        return loggedInDto;
    }

    public async Task<AppUser?> GetByIdAsync(ObjectId? userId, CancellationToken cancellationToken)
    {
        AppUser? appUser = await _collectionAppUser.Find<AppUser>(doc
            => doc.Id == userId).SingleOrDefaultAsync(cancellationToken);

        if (appUser is null) return null;

        return appUser;
    }

    public async Task<ObjectId?> GetObjectIdByUserNameAsync(string userName, CancellationToken cancellationToken)
    {
        ObjectId? userId = await _collectionAppUser.AsQueryable<AppUser>()
            .Where(appUser => appUser.NormalizedUserName == userName.ToUpper())
            .Select(item => item.Id)
            .SingleOrDefaultAsync(cancellationToken);

        return ValidationsExtensions.ValidateObjectId(userId);
    }

    public async Task<PagedList<AppUser>> GetAllAsync(MemberParams memberParams, CancellationToken cancellationToken)
    {
        PagedList<AppUser> appUsers = await PagedList<AppUser>.CreatePagedListAsync(
            CreateQuery(memberParams), memberParams.PageNumber, memberParams.PageSize, cancellationToken);

        return appUsers;
    }

    public async Task<IEnumerable<UserWithRoleDto>> GetUsersWithRolesAsync()
    {
        List<UserWithRoleDto> usersWithRoles = [];

        IEnumerable<AppUser> appUsers = _userManager.Users;

        foreach (AppUser appUser in appUsers)
        {
            IEnumerable<string> roles = await _userManager.GetRolesAsync(appUser);

            usersWithRoles.Add(
                new UserWithRoleDto(
                    UserName: appUser.UserName!,
                    Roles: roles
                )
            );
        }

        return usersWithRoles;
    }

    public async Task<EnrolledCourse?> AddEnrolledCourseAsync(
        AddEnrolledCourseDto addEnrolledCourseDto, string targetUserName,
        CancellationToken cancellationToken)
    {
        if (addEnrolledCourseDto.NumberOfPayments <= 0)
        {
            return null;
        }

        AppUser appUser = await _collectionAppUser
            .Find(doc => doc.NormalizedUserName == targetUserName.ToUpper())
            .FirstOrDefaultAsync(cancellationToken);

        if (appUser is null)
            return null;

        Course course = await _collectionCourse
            .Find(doc => doc.Title == addEnrolledCourseDto.TitleCourse.ToUpper())
            .FirstOrDefaultAsync(cancellationToken);

        if (course is null)
            return null;

        bool alreadyEnrolledAdded = appUser.EnrolledCourses.Any(doc => doc.CourseId == course.Id);
        if (alreadyEnrolledAdded)
            return null;

        int tuitionReminderCalc = course.Tuition - addEnrolledCourseDto.PaidAmount; // 1200
        int paymentPerMonthCalc = course.Tuition / addEnrolledCourseDto.NumberOfPayments; // => numberOfPayments = 4 / payment PerMonth = 300

        EnrolledCourse enrolledCourse = Mappers.ConvertAddEnrolledCourseDtoToEnrolledCourse(
            addEnrolledCourseDto, course, paymentPerMonthCalc, tuitionReminderCalc);

        if (enrolledCourse is null)
            return null;

        UpdateDefinition<AppUser> update = Builders<AppUser>.Update.AddToSet(doc => doc.EnrolledCourses, enrolledCourse);

        UpdateResult result = await _collectionAppUser.UpdateOneAsync(
            doc => doc.Id == appUser.Id, update, cancellationToken: cancellationToken);

        return result.ModifiedCount > 0 ? enrolledCourse : null;
    }

    public async Task<UpdateResult?> UpdateEnrolledCourseAsync(
        UpdateEnrolledDto updateEnrolledDto, string targetUserName,
        CancellationToken cancellationToken)
    {
        AppUser? appUser = await _collectionAppUser
            .Find(doc => doc.NormalizedUserName == targetUserName.ToUpper())
            .FirstOrDefaultAsync(cancellationToken);

        if (appUser is null)
            return null;

        EnrolledCourse? enrolledCourse = appUser.EnrolledCourses
            .FirstOrDefault(ec => ec.CourseTitle.ToUpper() == updateEnrolledDto.TitleCourse.ToUpper());

        if (enrolledCourse is null)
            return null;

        int newTotalPaidAmount = enrolledCourse.PaidAmount + updateEnrolledDto.PaidAmount;
        int tuitionReminder = enrolledCourse.CourseTuition - newTotalPaidAmount;

        // PaidNumber
        int newPaidNumber = newTotalPaidAmount / enrolledCourse.PaymentPerMonth;
        int numberOfPaymentsLeft = enrolledCourse.NumberOfPayments - newPaidNumber;

        // ایجاد پرداخت جدید
        Payment newPayment = new Payment(
            Id: ObjectId.GenerateNewId().ToString(),
            CourseTitle: updateEnrolledDto.TitleCourse.ToUpper(),
            Amount: updateEnrolledDto.PaidAmount,
            PaidOn: DateTime.UtcNow,
            Method: updateEnrolledDto.Method,
            Photo: null
        );

        // if (file is not null) {
        //     IEnumerable<string>? imageUrls = await _photoService.AddPhotoToDiskAsync(file, newPayment.Id);

        //     if (imageUrls is null)
        //         throw new ArgumentNullException("Saving photo has failed. Error from PhotoService.");

        //     Photo photo = Mappers.ConvertPhotoUrlsToPhoto(imageUrls.ToArray(), isMain: true);
        //     newPayment = newPayment with { Photo = photo };
        // }

        FilterDefinition<AppUser> filter = Builders<AppUser>.Filter.And(
            Builders<AppUser>.Filter.Eq(u => u.Id, appUser.Id),
            Builders<AppUser>.Filter.ElemMatch(u => u.EnrolledCourses, ec => ec.CourseTitle.ToUpper() == updateEnrolledDto.TitleCourse.ToUpper())
        );

        UpdateDefinition<AppUser> update = Builders<AppUser>.Update
            .Set("EnrolledCourses.$.PaidAmount", newTotalPaidAmount)
            .Set("EnrolledCourses.$.TuitionRemainder", tuitionReminder)
            .Set("EnrolledCourses.$.PaidNumber", newPaidNumber)
            .Set("EnrolledCourses.$.NumberOfPaymentsLeft", numberOfPaymentsLeft)
            .Push("EnrolledCourses.$.Payments", newPayment);

        return await _collectionAppUser.UpdateOneAsync(filter, update, cancellationToken: cancellationToken);
    }

    public async Task<DeleteResult?> DeleteAsync(string targetMemberUserName, CancellationToken cancellationToken)
    {
        ObjectId userId = await _collectionAppUser.AsQueryable()
            .Where(doc => doc.UserName == targetMemberUserName)
            .Select(doc => doc.Id)
            .FirstOrDefaultAsync(cancellationToken);

        AppUser? appUser = await GetByIdAsync(userId, cancellationToken);

        if (appUser is null)
            return null;

        return await _collectionAppUser.DeleteOneAsync<AppUser>(appUser => appUser.Id == userId, null, cancellationToken);
    }

    public async Task<List<AppUser>> GetAllTeachersAsync(CancellationToken cancellationToken)
    {
        IList<AppUser> teachers = await _userManager.GetUsersInRoleAsync("teacher");

        var pureTeachers = new List<AppUser>();

        foreach (var user in teachers)
        {
            if (!await _userManager.IsInRoleAsync(user, "admin"))
            {
                pureTeachers.Add(user);
            }
        }

        return pureTeachers;
        // IList<AppUser> teachers = await _userManager.GetUsersInRoleAsync("teacher");

        // return teachers.ToList();
    }

    public async Task<MemberDto?> GetMemberByEmailAsync(string targetMemberEmail, CancellationToken cancellationToken)
    {
        AppUser? appUser = await _userManager.FindByEmailAsync(targetMemberEmail);

        MemberDto memberDto = Mappers.ConvertAppUserToMemberDto(appUser, isAbsent: false);

        return memberDto;
    }

    public async Task<TargetMemberDto?> GetMemberByUserNameAsync(string targetUserName, CancellationToken cancellationToken)
    {
        AppUser? appUser = await _collectionAppUser.Find<AppUser>(appUser => appUser.NormalizedUserName == targetUserName.ToUpper())
            .FirstOrDefaultAsync(cancellationToken);

        if (appUser is null)
            return null;

        TargetMemberDto targetMemberDto = Mappers.ConvertAppUserToTargetMemberDto(appUser);

        return targetMemberDto;
    }

    public async Task<bool> UpdateMemberAsync(string memberUserName, ManagerUpdateMemberDto updatedMember, CancellationToken cancellationToken)
    {
        AppUser? targetAppUser = await _collectionAppUser.Find<AppUser>(doc =>
            doc.NormalizedUserName == memberUserName.ToUpper()).FirstOrDefaultAsync(cancellationToken);

        if (targetAppUser == null) return false;

        bool emailChanged = !string.Equals(targetAppUser.Email, updatedMember.Email, StringComparison.OrdinalIgnoreCase);
        // bool userNameChanged = !string.Equals(targetAppUser.UserName, updatedMember.UserName, StringComparison.OrdinalIgnoreCase);

        if (emailChanged)
        {
            targetAppUser.Email = updatedMember.Email;
            targetAppUser.NormalizedEmail = updatedMember.Email.ToUpper();
        }

        // if (userNameChanged)
        // {
        //     targetAppUser.UserName = updatedMember.UserName;
        //     targetAppUser.NormalizedUserName = updatedMember.UserName.ToUpper();
        // }

        IdentityResult result = await _userManager.UpdateAsync(targetAppUser);
        if (!result.Succeeded) return false;

        FilterDefinition<AppUser> filter = Builders<AppUser>.Filter.Eq(u => u.Id, targetAppUser.Id);
        UpdateDefinition<AppUser> update = Builders<AppUser>.Update
            .Set(u => u.Name, updatedMember.Name)
            .Set(u => u.LastName, updatedMember.LastName)
            .Set(u => u.PhoneNum, updatedMember.PhoneNum)
            .Set(u => u.Gender, updatedMember.Gender)
            .Set(u => u.DateOfBirth, updatedMember.DateOfBirth);

        var updateResult = await _collectionAppUser.UpdateOneAsync(filter, update, cancellationToken: cancellationToken);

        return updateResult.ModifiedCount > 0;
    }

    public async Task<Photo?> AddPhotoAsync(IFormFile file, string targetPaymentId, CancellationToken cancellationToken)
    {
        AppUser? appUser = await _collectionAppUser
            .Find(doc => doc.EnrolledCourses.Any(ec => ec.Payments.Any(p => p.Id == targetPaymentId)))
            .FirstOrDefaultAsync(cancellationToken);

        if (appUser is null)
            return null;

        EnrolledCourse? enrolledCourse = appUser.EnrolledCourses
            .FirstOrDefault(ec => ec.Payments.Any(p => p.Id == targetPaymentId));

        if (enrolledCourse is null)
            return null;

        Payment? payment = enrolledCourse.Payments.FirstOrDefault(p => p.Id == targetPaymentId);

        if (payment is null)
            return null;

        IEnumerable<string> imageUrls = await _photoService.AddPhotoToDiskAsync(file, targetPaymentId);

        if (imageUrls is null)
            throw new ArgumentNullException("Saving photo has failed. Error from PhotoService.");

        Photo photo = Mappers.ConvertPhotoUrlsToPhoto(imageUrls.ToArray(), isMain: true); // فرض می‌کنیم این متد عکس رو به Photo تبدیل می‌کند

        Payment updatedPayment = payment with { Photo = photo };

        var filter = Builders<AppUser>.Filter.Eq(u => u.Id, appUser.Id);
        var update = Builders<AppUser>.Update
            .Set("EnrolledCourses.$[ec].Payments.$[p]", updatedPayment);

        var arrayFilters = new List<ArrayFilterDefinition>
        {
            new BsonDocumentArrayFilterDefinition<BsonDocument>(
                new BsonDocument("ec.CourseTitle", enrolledCourse.CourseTitle)
            ),
            new BsonDocumentArrayFilterDefinition<BsonDocument>(
                new BsonDocument("p._id", updatedPayment.Id)
            )
        };

        UpdateResult result = await _collectionAppUser.UpdateOneAsync(
            filter,
            update,
            new UpdateOptions { ArrayFilters = arrayFilters },
            cancellationToken);

        return result.ModifiedCount > 0 ? photo : null;
    }

    public async Task<bool> DeletePhotoAsync(string targetPaymentId, CancellationToken cancellationToken)
    {
        AppUser? appUser = await _collectionAppUser
            .Find(u => u.EnrolledCourses.Any(ec => ec.Payments.Any(p => p.Id == targetPaymentId)))
            .FirstOrDefaultAsync(cancellationToken);

        if (appUser is null) return false;

        EnrolledCourse? enrolledCourse = appUser.EnrolledCourses
            .FirstOrDefault(ec => ec.Payments.Any(p => p.Id == targetPaymentId));

        if (enrolledCourse is null) return false;

        Payment? payment = enrolledCourse.Payments.FirstOrDefault(p => p.Id == targetPaymentId);

        if (payment is null || payment.Photo is null) return false;

        bool isDeleteSuccess = await _photoService.DeletePhotoFromDisk(payment.Photo);
        if (!isDeleteSuccess)
        {
            return false;
        }

        payment = payment with { Photo = null };

        var filter = Builders<AppUser>.Filter.Eq(u => u.Id, appUser.Id);
        var update = Builders<AppUser>.Update
            .Set("EnrolledCourses.$[ec].Payments.$[p]", payment);

        var arrayFilters = new List<ArrayFilterDefinition>
        {
            new BsonDocumentArrayFilterDefinition<BsonDocument>(
                new BsonDocument("ec.CourseTitle", enrolledCourse.CourseTitle)
            ),
            new BsonDocumentArrayFilterDefinition<BsonDocument>(
                new BsonDocument("p._id", payment.Id)
            )
        };

        UpdateResult result = await _collectionAppUser.UpdateOneAsync(
            filter,
            update,
            new UpdateOptions { ArrayFilters = arrayFilters },
            cancellationToken);

        return result.ModifiedCount > 0;
    }

    public async Task<List<Course?>> GetTargetMemberCourseAsync(string targetUserName, CancellationToken cancellationToken)
    {
        List<string>? enrolledCourseIds = await _collectionAppUser.AsQueryable<AppUser>()
            .Where(appUser => appUser.NormalizedUserName == targetUserName.ToUpper())
            .SelectMany(appUser => appUser.EnrolledCourses)
            .Select(doc => doc.CourseId.ToString())
            .ToListAsync(cancellationToken);

        if (enrolledCourseIds is null || !enrolledCourseIds.Any())
            return null;

        List<Course>? courses = await _collectionCourse.Find<Course>(doc =>
            enrolledCourseIds.Contains(doc.Id.ToString())).ToListAsync(cancellationToken);

        if (courses is null)
        {
            return null;
        }

        return courses is null
            ? null
            // : Mappers.ConvertAppUserToLoggedInDto(appUser, token);
            : courses;
    }

    public async Task<EnrolledCourse?> GetTargetMemberEnrolledCourseAsync(string targetUserName, string courseTitle, CancellationToken cancellationToken)
    {
        AppUser? appUser = await _collectionAppUser.Find<AppUser>(
            doc => doc.NormalizedUserName == targetUserName.ToUpper()
        ).FirstOrDefaultAsync(cancellationToken);

        if (appUser is null)
            return null;

        EnrolledCourse? enrolledCourse = appUser.EnrolledCourses
            .FirstOrDefault(ec => ec.CourseTitle == courseTitle.ToUpper());
        if (enrolledCourse is null)
            return null;

        return enrolledCourse;
    }

    public async Task<Payment?> GetTargetPaymentByIdAsync(string targetPaymentId, CancellationToken cancellationToken)
    {
        // if (!ObjectId.TryParse(targetPaymentId, out ObjectId paymentObjectId))
        //     return null; // یا throw BadRequestException یا لاگ کردن

        AppUser? appUser = await _collectionAppUser
            .Find(doc => doc.EnrolledCourses.Any(ec => ec.Payments.Any(p => p.Id == targetPaymentId)))
            .FirstOrDefaultAsync(cancellationToken);

        if (appUser is null)
            return null;

        EnrolledCourse? enrolledCourse = appUser.EnrolledCourses
            .FirstOrDefault(ec => ec.Payments.Any(p => p.Id == targetPaymentId));

        if (enrolledCourse is null)
            return null;

        Payment? payment = enrolledCourse.Payments.FirstOrDefault(p => p.Id == targetPaymentId);

        if (payment is null)
            return null;

        return payment;
    }

    public async Task<List<string>> GetTargetCourseTitleAsync(string targetUserName, CancellationToken cancellationToken)
    {
        List<string>? courseTitles = await _collectionAppUser.AsQueryable<AppUser>()
            .Where(appUser => appUser.NormalizedUserName == targetUserName.ToUpper())
            .SelectMany(appUser => appUser.EnrolledCourses)
            .Select(doc => doc.CourseTitle.ToUpper())
            .ToListAsync(cancellationToken);

        return courseTitles.Count <= 0
            ? null
            : courseTitles;
    }

    public async Task<PagedList<Attendence>> GetAllAttendenceAsync(AttendenceParams attendenceParams, string targetMemberUserName, string targetCourseTitle, CancellationToken cancellationToken)
    {
        AppUser? appUser = await _collectionAppUser.Find<AppUser>(
            doc => doc.NormalizedUserName == targetMemberUserName.ToUpper()).FirstOrDefaultAsync(cancellationToken);
        if (appUser is null)
            return null;

        ObjectId? targetCourseId = await _collectionCourse.AsQueryable()
            .Where(doc => doc.Title == targetCourseTitle.ToUpper())
            .Select(doc => doc.Id)
            .FirstOrDefaultAsync(cancellationToken);

        if (targetCourseId is null)
            return null;

        IMongoQueryable<Attendence>? query = _collectionAttendence.AsQueryable<Attendence>()
            .Where(doc => doc.StudentId == appUser.Id && doc.CourseId == targetCourseId);

        return await PagedList<Attendence>.CreatePagedListAsync(query, attendenceParams.PageNumber, attendenceParams.PageSize, cancellationToken);
    }
}