namespace api.Repositories;

public class ManagerRepository : IManagerRepository
{
    #region Vars and Constructor
    private readonly IMongoCollection<AppUser> _collectionAppUser;
    private readonly IMongoCollection<Course> _collectionCourse;
    private readonly IMongoCollection<Attendence> _collectionAttendence;
    private readonly UserManager<AppUser> _userManager;
    private readonly ITokenService _tokenService;
    private readonly IMongoClient _client;
    private readonly IPhotoService _photoService;

    public ManagerRepository(
        IMongoClient client,
        ITokenService tokenService,
        IMyMongoDbSettings dbSettings,
        UserManager<AppUser> userManager,
        IPhotoService photoService)
    {
        _client = client; // used for Session
        var database = client.GetDatabase(dbSettings.DatabaseName);

        _collectionAppUser = database.GetCollection<AppUser>(AppVariablesExtensions.CollectionUsers);
        _collectionCourse = database.GetCollection<Course>(AppVariablesExtensions.CollectionCourses);
        _collectionAttendence = database.GetCollection<Attendence>(AppVariablesExtensions.CollectionAttendences);

        _userManager = userManager;
        _tokenService = tokenService;
        _photoService = photoService;
    }
    #endregion

    private IMongoQueryable<AppUser> CreateQuery(MemberParams memberParams)
    {
        DateOnly minDob = DateOnly.FromDateTime(DateTime.Today.AddYears(-memberParams.MaxAge - 1));
        DateOnly maxDob = DateOnly.FromDateTime(DateTime.Today.AddYears(-memberParams.MinAge));

        var query = _collectionAppUser.AsQueryable();

        if (!string.IsNullOrWhiteSpace(memberParams.Search))
        {
            var s = memberParams.Search.ToUpper();
            query = query.Where(u =>
                u.Name.ToUpper().Contains(s) ||
                u.NormalizedUserName.Contains(s) ||
                u.LastName.ToUpper().Contains(s));
        }

        query = query.Where(u => u.NormalizedUserName != "ADMIN" && u.NormalizedUserName != "MANAGER");
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
            newUserName = Mappers.Utils.GenerateComplexUsername(8);
            exists = await _collectionAppUser
                .Find(u => u.UserName == newUserName)
                .AnyAsync(cancellationToken);
        }
        while (exists);

        return newUserName;
    }

    public async Task<RegisteredUserDto?> CreateSecretaryAsync(RegisterDto registerDto, CancellationToken cancellationToken)
    {
        var dto = new RegisteredUserDto();

        var existingByEmail = await _userManager.FindByEmailAsync(registerDto.Email);
        if (existingByEmail is not null)
        {
            dto.Errors.Add("این ایمیل قبلاً ثبت شده است.");
            return dto;
        }

        bool doesPhoneNumExist = await _collectionAppUser
            .Find(doc => doc.PhoneNum == registerDto.PhoneNum)
            .AnyAsync(cancellationToken);

        if (doesPhoneNumExist)
        {
            dto.Errors.Add("شماره تلفن وارد شده قبلاً ثبت شده است.");
            return dto;
        }

        string uniqueUsername = await GenerateUniqueUsernameAsync(cancellationToken);

        var appUser = new AppUser
        {
            Email = registerDto.Email,
            UserName = uniqueUsername,
            DateOfBirth = registerDto.DateOfBirth,
            Name = registerDto.Name?.Trim() ?? string.Empty,
            LastName = registerDto.LastName?.Trim() ?? string.Empty,
            PhoneNum = registerDto.PhoneNum,
            Gender = registerDto.Gender
        };

        var createRes = await _userManager.CreateAsync(appUser, registerDto.Password);
        if (!createRes.Succeeded)
        {
            foreach (var e in createRes.Errors) dto.Errors.Add(e.Description);
            return dto;
        }

        var roleRes = await _userManager.AddToRoleAsync(appUser, "secretary");
        if (!roleRes.Succeeded)
        {
            foreach (var e in roleRes.Errors) dto.Errors.Add(e.Description);
            return dto;
        }

        return Mappers.ConvertAppUserToRegisteredDto(appUser);
    }

    public async Task<RegisteredUserDto?> CreateStudentAsync(RegisterDto registerDto, CancellationToken cancellationToken)
    {
        var dto = new RegisteredUserDto();

        var existingByEmail = await _userManager.FindByEmailAsync(registerDto.Email);
        if (existingByEmail is not null)
        {
            dto.Errors.Add("این ایمیل قبلاً ثبت شده است.");
            return dto;
        }

        bool doesPhoneNumExist = await _collectionAppUser
            .Find(doc => doc.PhoneNum == registerDto.PhoneNum)
            .AnyAsync(cancellationToken);

        if (doesPhoneNumExist)
        {
            dto.Errors.Add("شماره تلفن وارد شده قبلاً ثبت شده است.");
            return dto;
        }

        string uniqueUsername = await GenerateUniqueUsernameAsync(cancellationToken);

        var appUser = new AppUser
        {
            Email = registerDto.Email,
            UserName = uniqueUsername,
            DateOfBirth = registerDto.DateOfBirth,
            Name = registerDto.Name?.Trim() ?? string.Empty,
            LastName = registerDto.LastName?.Trim() ?? string.Empty,
            PhoneNum = registerDto.PhoneNum,
            Gender = registerDto.Gender
        };

        var createRes = await _userManager.CreateAsync(appUser, registerDto.Password);
        if (!createRes.Succeeded)
        {
            foreach (var e in createRes.Errors) dto.Errors.Add(e.Description);
            return dto;
        }

        var roleRes = await _userManager.AddToRoleAsync(appUser, "student");
        if (!roleRes.Succeeded)
        {
            foreach (var e in roleRes.Errors) dto.Errors.Add(e.Description);
            return dto;
        }

        return Mappers.ConvertAppUserToRegisteredDto(appUser);
    }

    public async Task<RegisteredUserDto?> CreateTeacherAsync(RegisterDto registerDto, CancellationToken cancellationToken)
    {
        var dto = new RegisteredUserDto();

        var existingByEmail = await _userManager.FindByEmailAsync(registerDto.Email);
        if (existingByEmail is not null)
        {
            dto.Errors.Add("این ایمیل قبلاً ثبت شده است.");
            return dto;
        }

        bool doesPhoneNumExist = await _collectionAppUser
            .Find(doc => doc.PhoneNum == registerDto.PhoneNum)
            .AnyAsync(cancellationToken);

        if (doesPhoneNumExist)
        {
            dto.Errors.Add("شماره تلفن وارد شده قبلاً ثبت شده است.");
            return dto;
        }

        string uniqueUsername = await GenerateUniqueUsernameAsync(cancellationToken);

        var appUser = new AppUser
        {
            Email = registerDto.Email,
            UserName = uniqueUsername,
            DateOfBirth = registerDto.DateOfBirth,
            Name = registerDto.Name?.Trim() ?? string.Empty,
            LastName = registerDto.LastName?.Trim() ?? string.Empty,
            PhoneNum = registerDto.PhoneNum,
            Gender = registerDto.Gender
        };

        var createRes = await _userManager.CreateAsync(appUser, registerDto.Password);
        if (!createRes.Succeeded)
        {
            foreach (var e in createRes.Errors) dto.Errors.Add(e.Description);
            return dto;
        }

        var roleRes = await _userManager.AddToRoleAsync(appUser, "teacher");
        if (!roleRes.Succeeded)
        {
            foreach (var e in roleRes.Errors) dto.Errors.Add(e.Description);
            return dto;
        }

        return Mappers.ConvertAppUserToRegisteredDto(appUser);
    }

    public async Task<AppUser?> GetByIdAsync(ObjectId? userId, CancellationToken cancellationToken)
    {
        if (userId is null) return null;

        return await _collectionAppUser
            .Find(doc => doc.Id == userId)
            .SingleOrDefaultAsync(cancellationToken);
    }

    public async Task<ObjectId?> GetObjectIdByUserNameAsync(string userName, CancellationToken cancellationToken)
    {
        var userId = await _collectionAppUser.AsQueryable()
            .Where(u => u.NormalizedUserName == userName.ToUpper())
            .Select(u => u.Id)
            .SingleOrDefaultAsync(cancellationToken);

        return ValidationsExtensions.ValidateObjectId(userId);
    }

    public async Task<PagedList<AppUser>> GetAllAsync(MemberParams memberParams, CancellationToken cancellationToken)
    {
        var query = CreateQuery(memberParams);
        return await PagedList<AppUser>.CreatePagedListAsync(
            query, memberParams.PageNumber, memberParams.PageSize, cancellationToken);
    }

    public async Task<IEnumerable<UserWithRoleDto>> GetUsersWithRolesAsync()
    {
        var usersWithRoles = new List<UserWithRoleDto>();
        IEnumerable<AppUser> appUsers = _userManager.Users;

        foreach (var appUser in appUsers)
        {
            IEnumerable<string> roles = await _userManager.GetRolesAsync(appUser);
            usersWithRoles.Add(new UserWithRoleDto(UserName: appUser.UserName!, Roles: roles));
        }

        return usersWithRoles;
    }

    public async Task<EnrolledCourse?> AddEnrolledCourseAsync(
        AddEnrolledCourseDto addEnrolledCourseDto,
        string targetUserName,
        CancellationToken cancellationToken)
    {
        if (addEnrolledCourseDto.NumberOfPayments <= 0) return null;

        var appUser = await _collectionAppUser
            .Find(doc => doc.NormalizedUserName == targetUserName.ToUpper())
            .FirstOrDefaultAsync(cancellationToken);
        if (appUser is null) return null;

        var course = await _collectionCourse
            .Find(doc => doc.Title == addEnrolledCourseDto.TitleCourse.ToUpper())
            .FirstOrDefaultAsync(cancellationToken);
        if (course is null) return null;

        bool alreadyEnrolledAdded = appUser.EnrolledCourses.Any(doc => doc.CourseId == course.Id);
        if (alreadyEnrolledAdded) return null;

        int tuitionReminderCalc = course.Tuition / 1 - addEnrolledCourseDto.PaidAmount; // همون قبلی؛ فقط محاسبه ساده
        int paymentPerMonthCalc = course.Tuition / addEnrolledCourseDto.NumberOfPayments;

        var enrolledCourse = Mappers.ConvertAddEnrolledCourseDtoToEnrolledCourse(
            addEnrolledCourseDto, course, paymentPerMonthCalc, tuitionReminderCalc);

        var filter = Builders<AppUser>.Filter.Eq(u => u.Id, appUser.Id);
        var update = Builders<AppUser>.Update.AddToSet(u => u.EnrolledCourses, enrolledCourse);

        var result = await _collectionAppUser.UpdateOneAsync(filter, update, cancellationToken: cancellationToken);

        return result.ModifiedCount > 0 ? enrolledCourse : null;
    }

    public async Task<UpdateResult?> UpdateEnrolledCourseAsync(
        UpdateEnrolledDto updateEnrolledDto,
        string targetUserName,
        CancellationToken cancellationToken)
    {
        var appUser = await _collectionAppUser
            .Find(doc => doc.NormalizedUserName == targetUserName.ToUpper())
            .FirstOrDefaultAsync(cancellationToken);
        if (appUser is null) return null;

        var enrolledCourse = appUser.EnrolledCourses
            .FirstOrDefault(ec => ec.CourseTitle.ToUpper() == updateEnrolledDto.TitleCourse.ToUpper());
        if (enrolledCourse is null) return null;

        int newTotalPaidAmount = enrolledCourse.PaidAmount + updateEnrolledDto.PaidAmount;
        int tuitionReminder = enrolledCourse.CourseTuition - newTotalPaidAmount;
        int newPaidNumber = newTotalPaidAmount / enrolledCourse.PaymentPerMonth;
        int numberOfPaymentsLeft = enrolledCourse.NumberOfPayments - newPaidNumber;

        var newPayment = new Payment(
            Id: ObjectId.GenerateNewId().ToString(),
            CourseTitle: updateEnrolledDto.TitleCourse.ToUpper(),
            Amount: updateEnrolledDto.PaidAmount,
            PaidOn: DateTime.UtcNow,
            Method: updateEnrolledDto.Method,
            Photo: null
        );

        var filter = Builders<AppUser>.Filter.And(
            Builders<AppUser>.Filter.Eq(u => u.Id, appUser.Id),
            Builders<AppUser>.Filter.ElemMatch(u => u.EnrolledCourses,
                ec => ec.CourseTitle.ToUpper() == updateEnrolledDto.TitleCourse.ToUpper())
        );

        var update = Builders<AppUser>.Update
            .Set("EnrolledCourses.$.PaidAmount", newTotalPaidAmount)
            .Set("EnrolledCourses.$.TuitionRemainder", tuitionReminder)
            .Set("EnrolledCourses.$.PaidNumber", newPaidNumber)
            .Set("EnrolledCourses.$.NumberOfPaymentsLeft", numberOfPaymentsLeft)
            .Push("EnrolledCourses.$.Payments", newPayment);

        return await _collectionAppUser.UpdateOneAsync(filter, update, cancellationToken: cancellationToken);
    }

    public async Task<DeleteResult?> DeleteAsync(string targetMemberUserName, CancellationToken cancellationToken)
    {
        var userId = await _collectionAppUser.AsQueryable()
            .Where(u => u.UserName == targetMemberUserName)
            .Select(u => u.Id)
            .FirstOrDefaultAsync(cancellationToken);

        if (userId == default) return null;

        var filter = Builders<AppUser>.Filter.Eq(u => u.Id, userId);
        return await _collectionAppUser.DeleteOneAsync(filter, cancellationToken);
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
    }

    public async Task<MemberDto?> GetMemberByEmailAsync(string targetMemberEmail, CancellationToken cancellationToken)
    {
        var appUser = await _userManager.FindByEmailAsync(targetMemberEmail);
        if (appUser is null) return null;

        return Mappers.ConvertAppUserToMemberDto(appUser, isAbsent: false);
    }

    public async Task<TargetMemberDto?> GetMemberByUserNameAsync(string targetUserName, CancellationToken cancellationToken)
    {
        var appUser = await _collectionAppUser
            .Find(u => u.NormalizedUserName == targetUserName.ToUpper())
            .FirstOrDefaultAsync(cancellationToken);

        if (appUser is null) return null;

        return Mappers.ConvertAppUserToTargetMemberDto(appUser);
    }

    public async Task<bool> UpdateMemberAsync(string memberUserName, ManagerUpdateMemberDto updatedMember, CancellationToken cancellationToken)
    {
        var targetAppUser = await _collectionAppUser
            .Find(u => u.NormalizedUserName == memberUserName.ToUpper())
            .FirstOrDefaultAsync(cancellationToken);

        if (targetAppUser is null) return false;

        bool emailChanged = !string.Equals(targetAppUser.Email, updatedMember.Email, StringComparison.OrdinalIgnoreCase);

        if (emailChanged)
        {
            targetAppUser.Email = updatedMember.Email;
            targetAppUser.NormalizedEmail = updatedMember.Email.ToUpper();

            var identityUpdate = await _userManager.UpdateAsync(targetAppUser);
            if (!identityUpdate.Succeeded) return false;
        }

        var filter = Builders<AppUser>.Filter.Eq(u => u.Id, targetAppUser.Id);

        var genderValue = updatedMember.Gender?.ToString().ToLower() ?? string.Empty;

        var update = Builders<AppUser>.Update
            .Set(u => u.Name, updatedMember.Name)
            .Set(u => u.LastName, updatedMember.LastName)
            .Set(u => u.PhoneNum, updatedMember.PhoneNum)
            .Set("Gender", genderValue)
            .Set(u => u.DateOfBirth, updatedMember.DateOfBirth);

        var updateResult = await _collectionAppUser.UpdateOneAsync(filter, update, cancellationToken: cancellationToken);
        return updateResult.ModifiedCount > 0;
    }


    public async Task<Photo?> AddPhotoAsync(IFormFile file, string targetPaymentId, CancellationToken cancellationToken)
    {
        var appUser = await _collectionAppUser
            .Find(u => u.EnrolledCourses.Any(ec => ec.Payments.Any(p => p.Id == targetPaymentId)))
            .FirstOrDefaultAsync(cancellationToken);
        if (appUser is null) return null;

        var enrolledCourse = appUser.EnrolledCourses
            .FirstOrDefault(ec => ec.Payments.Any(p => p.Id == targetPaymentId));
        if (enrolledCourse is null) return null;

        var payment = enrolledCourse.Payments.FirstOrDefault(p => p.Id == targetPaymentId);
        if (payment is null) return null;

        var imageUrls = await _photoService.AddPhotoToDiskAsync(file, targetPaymentId);
        if (imageUrls is null) throw new ArgumentNullException("Saving photo has failed. Error from PhotoService.");

        var photo = Mappers.ConvertPhotoUrlsToPhoto(imageUrls.ToArray(), isMain: true);

        var updatedPayment = payment with { Photo = photo };

        var filter = Builders<AppUser>.Filter.Eq(u => u.Id, appUser.Id);
        var update = Builders<AppUser>.Update
            .Set("EnrolledCourses.$[ec].Payments.$[p]", updatedPayment);

        var arrayFilters = new List<ArrayFilterDefinition>
        {
            new BsonDocumentArrayFilterDefinition<BsonDocument>(new BsonDocument("ec.CourseTitle", enrolledCourse.CourseTitle)),
            new BsonDocumentArrayFilterDefinition<BsonDocument>(new BsonDocument("p._id", updatedPayment.Id))
        };

        var result = await _collectionAppUser.UpdateOneAsync(
            filter, update, new UpdateOptions { ArrayFilters = arrayFilters }, cancellationToken);

        return result.ModifiedCount > 0 ? photo : null;
    }

    public async Task<bool> DeletePhotoAsync(string targetPaymentId, CancellationToken cancellationToken)
    {
        var appUser = await _collectionAppUser
            .Find(u => u.EnrolledCourses.Any(ec => ec.Payments.Any(p => p.Id == targetPaymentId)))
            .FirstOrDefaultAsync(cancellationToken);
        if (appUser is null) return false;

        var enrolledCourse = appUser.EnrolledCourses
            .FirstOrDefault(ec => ec.Payments.Any(p => p.Id == targetPaymentId));
        if (enrolledCourse is null) return false;

        var payment = enrolledCourse.Payments.FirstOrDefault(p => p.Id == targetPaymentId);
        if (payment is null || payment.Photo is null) return false;

        bool isDeleteSuccess = await _photoService.DeletePhotoFromDisk(payment.Photo);
        if (!isDeleteSuccess) return false;

        var updatedPayment = payment with { Photo = null };

        var filter = Builders<AppUser>.Filter.Eq(u => u.Id, appUser.Id);
        var update = Builders<AppUser>.Update
            .Set("EnrolledCourses.$[ec].Payments.$[p]", updatedPayment);

        var arrayFilters = new List<ArrayFilterDefinition>
        {
            new BsonDocumentArrayFilterDefinition<BsonDocument>(new BsonDocument("ec.CourseTitle", enrolledCourse.CourseTitle)),
            new BsonDocumentArrayFilterDefinition<BsonDocument>(new BsonDocument("p._id", payment.Id))
        };

        var result = await _collectionAppUser.UpdateOneAsync(
            filter, update, new UpdateOptions { ArrayFilters = arrayFilters }, cancellationToken);

        return result.ModifiedCount > 0;
    }

    public async Task<List<Course?>?> GetTargetMemberCourseAsync(string targetUserName, CancellationToken cancellationToken)
    {
        var enrolledCourseIds = await _collectionAppUser.AsQueryable()
            .Where(u => u.NormalizedUserName == targetUserName.ToUpper())
            .SelectMany(u => u.EnrolledCourses)
            .Select(ec => ec.CourseId.ToString())
            .ToListAsync(cancellationToken);

        if (enrolledCourseIds is null || enrolledCourseIds.Count == 0) return null;

        var courses = await _collectionCourse
            .Find(doc => enrolledCourseIds.Contains(doc.Id.ToString()))
            .ToListAsync(cancellationToken);

        return courses;
    }

    public async Task<EnrolledCourse?> GetTargetMemberEnrolledCourseAsync(string targetUserName, string courseTitle, CancellationToken cancellationToken)
    {
        var appUser = await _collectionAppUser
            .Find(doc => doc.NormalizedUserName == targetUserName.ToUpper())
            .FirstOrDefaultAsync(cancellationToken);
        if (appUser is null) return null;

        return appUser.EnrolledCourses.FirstOrDefault(ec => ec.CourseTitle == courseTitle.ToUpper());
    }

    public async Task<Payment?> GetTargetPaymentByIdAsync(string targetPaymentId, CancellationToken cancellationToken)
    {
        var appUser = await _collectionAppUser
            .Find(doc => doc.EnrolledCourses.Any(ec => ec.Payments.Any(p => p.Id == targetPaymentId)))
            .FirstOrDefaultAsync(cancellationToken);
        if (appUser is null) return null;

        var enrolledCourse = appUser.EnrolledCourses
            .FirstOrDefault(ec => ec.Payments.Any(p => p.Id == targetPaymentId));
        if (enrolledCourse is null) return null;

        return enrolledCourse.Payments.FirstOrDefault(p => p.Id == targetPaymentId);
    }

    public async Task<List<string>?> GetTargetCourseTitleAsync(string targetUserName, CancellationToken cancellationToken)
    {
        var courseTitles = await _collectionAppUser.AsQueryable()
            .Where(u => u.NormalizedUserName == targetUserName.ToUpper())
            .SelectMany(u => u.EnrolledCourses)
            .Select(ec => ec.CourseTitle.ToUpper())
            .ToListAsync(cancellationToken);

        return courseTitles.Count == 0 ? null : courseTitles;
    }

    public async Task<PagedList<Attendence>?> GetAllAttendenceAsync(
        AttendenceParams attendenceParams,
        string targetMemberUserName,
        string targetCourseTitle,
        CancellationToken cancellationToken)
    {
        var appUser = await _collectionAppUser
            .Find(doc => doc.NormalizedUserName == targetMemberUserName.ToUpper())
            .FirstOrDefaultAsync(cancellationToken);
        if (appUser is null) return null;

        var targetCourseId = await _collectionCourse.AsQueryable()
            .Where(doc => doc.Title == targetCourseTitle.ToUpper())
            .Select(doc => doc.Id)
            .FirstOrDefaultAsync(cancellationToken);
        if (targetCourseId == default) return null;

        var query = _collectionAttendence.AsQueryable()
            .Where(doc => doc.StudentId == appUser.Id && doc.CourseId == targetCourseId);

        return await PagedList<Attendence>.CreatePagedListAsync(
            query, attendenceParams.PageNumber, attendenceParams.PageSize, cancellationToken);
    }
}