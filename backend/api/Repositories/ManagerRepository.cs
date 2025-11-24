using api.DTOs.Account;
using api.DTOs.Helpers;

namespace api.Repositories;

public class ManagerRepository : IManagerRepository
{
  public async Task<OperationResult> UpdateAccountAsync(ManagerUpdateProfile dto, ObjectId userId, CancellationToken ct)
  {
    AppUser? user = await _userManager.FindByIdAsync(userId.ToString());
    if (user is null)
    {
      return new OperationResult(
        false,
        Error: new CustomError(
          ErrorCode.IsUserNotFound,
          Message: "User not found."
        )
      );
    }

    List<UpdateDefinition<AppUser>> updateDefinitions = new List<UpdateDefinition<AppUser>>();
    UpdateDefinitionBuilder<AppUser> updateDefinitionBuilder = Builders<AppUser>.Update;

    if (!string.IsNullOrWhiteSpace(dto.Name))
    {
      string trimmed = dto.Name.Trim();
      if (!string.Equals(user.Name, trimmed, StringComparison.Ordinal))
      {
        updateDefinitions.Add(updateDefinitionBuilder.Set(appUser => appUser.Name, trimmed));
      }
    }

    if (!string.IsNullOrWhiteSpace(dto.LastName))
    {
      string trimmed = dto.LastName.Trim();
      if (!string.Equals(user.LastName, trimmed, StringComparison.Ordinal))
      {
        updateDefinitions.Add(updateDefinitionBuilder.Set(appUser => appUser.LastName, trimmed));
      }
    }

    if (dto.DateOfBirth is not null && user.DateOfBirth != dto.DateOfBirth.Value)
    {
      updateDefinitions.Add(updateDefinitionBuilder.Set(appUser => appUser.DateOfBirth, dto.DateOfBirth.Value));
    }

    if (!string.IsNullOrWhiteSpace(dto.PhoneNum))
    {
      string phone = dto.PhoneNum.Trim();

      if (!string.Equals(user.PhoneNum, phone, StringComparison.Ordinal))
      {
        updateDefinitions.Add(updateDefinitionBuilder.Set(appUser => appUser.PhoneNum, phone));
      }
    }

    if (!string.IsNullOrWhiteSpace(dto.Gender))
    {
      if (Enum.TryParse<GenderType>(dto.Gender.Trim(), true, out var parsedGender))
      {
        updateDefinitions.Add(updateDefinitionBuilder.Set(appUser => appUser.Gender, parsedGender));
      }
      else
      {
        return new OperationResult(
          false,
          Error: new CustomError(
            ErrorCode.IsInvalidType,
            "Enter valid gender"
          )
        );
      }
    }

    if (updateDefinitions.Count > 0)
    {
      UpdateDefinition<AppUser> updateDef = Builders<AppUser>.Update.Combine(updateDefinitions);

      UpdateResult updateResult = await _collectionAppUser.UpdateOneAsync(doc => doc.Id == userId, updateDef, null, ct);

      return new OperationResult(
        true,
        null
      );
    }

    return new OperationResult(
      false,
      new CustomError(
        ErrorCode.IsOperationFailed,
        "No update was made."
      )
    );
  }

  public async Task<RegisteredUserDto?> CreateSecretaryAsync(
    RegisterDto registerDto, CancellationToken cancellationToken
  )
  {
    var dto = new RegisteredUserDto();

    AppUser? existingByEmail = await _userManager.FindByEmailAsync(registerDto.Email);
    if (existingByEmail is not null)
    {
      dto.Errors.Add("این ایمیل قبلاً ثبت شده است.");
      return dto;
    }

    bool doesPhoneNumExist = await _collectionAppUser.Find(doc => doc.PhoneNum == registerDto.PhoneNum).
      AnyAsync(cancellationToken);

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

    IdentityResult createRes = await _userManager.CreateAsync(appUser, registerDto.Password);
    if (!createRes.Succeeded)
    {
      foreach (IdentityError e in createRes.Errors) dto.Errors.Add(e.Description);
      return dto;
    }

    IdentityResult roleRes = await _userManager.AddToRoleAsync(appUser, "secretary");
    if (!roleRes.Succeeded)
    {
      foreach (IdentityError e in roleRes.Errors) dto.Errors.Add(e.Description);
      return dto;
    }

    return ConvertAppUserToRegisteredDto(appUser);
  }

  public async Task<RegisteredUserDto?> CreateStudentAsync(RegisterDto registerDto, CancellationToken cancellationToken)
  {
    var dto = new RegisteredUserDto();

    AppUser? existingByEmail = await _userManager.FindByEmailAsync(registerDto.Email);
    if (existingByEmail is not null)
    {
      dto.Errors.Add("این ایمیل قبلاً ثبت شده است.");
      return dto;
    }

    bool doesPhoneNumExist = await _collectionAppUser.Find(doc => doc.PhoneNum == registerDto.PhoneNum).
      AnyAsync(cancellationToken);

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

    IdentityResult createRes = await _userManager.CreateAsync(appUser, registerDto.Password);
    if (!createRes.Succeeded)
    {
      foreach (IdentityError e in createRes.Errors) dto.Errors.Add(e.Description);
      return dto;
    }

    IdentityResult roleRes = await _userManager.AddToRoleAsync(appUser, "student");
    if (!roleRes.Succeeded)
    {
      foreach (IdentityError e in roleRes.Errors) dto.Errors.Add(e.Description);
      return dto;
    }

    return ConvertAppUserToRegisteredDto(appUser);
  }

  public async Task<RegisteredUserDto?> CreateTeacherAsync(RegisterDto registerDto, CancellationToken cancellationToken)
  {
    var dto = new RegisteredUserDto();

    AppUser? existingByEmail = await _userManager.FindByEmailAsync(registerDto.Email);
    if (existingByEmail is not null)
    {
      dto.Errors.Add("این ایمیل قبلاً ثبت شده است.");
      return dto;
    }

    bool doesPhoneNumExist = await _collectionAppUser.Find(doc => doc.PhoneNum == registerDto.PhoneNum).
      AnyAsync(cancellationToken);

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

    IdentityResult createRes = await _userManager.CreateAsync(appUser, registerDto.Password);
    if (!createRes.Succeeded)
    {
      foreach (IdentityError e in createRes.Errors) dto.Errors.Add(e.Description);
      return dto;
    }

    IdentityResult roleRes = await _userManager.AddToRoleAsync(appUser, "teacher");
    if (!roleRes.Succeeded)
    {
      foreach (IdentityError e in roleRes.Errors) dto.Errors.Add(e.Description);
      return dto;
    }

    return ConvertAppUserToRegisteredDto(appUser);
  }

  public async Task<PagedList<AppUser>> GetAllAsync(MemberParams memberParams, CancellationToken cancellationToken)
  {
    IQueryable<AppUser> query = CreateQuery(memberParams);
    return await PagedList<AppUser>.CreatePagedListAsync(
      query, memberParams.PageNumber, memberParams.PageSize, cancellationToken
    );
  }

  public async Task<IEnumerable<UserWithRoleDto>> GetUsersWithRolesAsync()
  {
    var usersWithRoles = new List<UserWithRoleDto>();
    IEnumerable<AppUser> appUsers = _userManager.Users;

    foreach (AppUser appUser in appUsers)
    {
      IEnumerable<string> roles = await _userManager.GetRolesAsync(appUser);
      usersWithRoles.Add(new UserWithRoleDto(appUser.UserName!, roles));
    }

    return usersWithRoles;
  }

  public async Task<EnrolledCourse?> AddEnrolledCourseAsync(
    AddEnrolledCourseDto addEnrolledCourseDto,
    string targetUserName,
    CancellationToken cancellationToken
  )
  {
    if (addEnrolledCourseDto.NumberOfPayments <= 0) return null;

    AppUser? appUser = await _collectionAppUser.Find(doc => doc.NormalizedUserName == targetUserName.ToUpper()).
      FirstOrDefaultAsync(cancellationToken);
    if (appUser is null) return null;

    Course? course = await _collectionCourse.Find(doc => doc.Title == addEnrolledCourseDto.TitleCourse.ToUpper()).
      FirstOrDefaultAsync(cancellationToken);
    if (course is null) return null;

    bool alreadyEnrolledAdded = appUser.EnrolledCourses.Any(doc => doc.CourseId == course.Id);
    if (alreadyEnrolledAdded) return null;

    int tuitionReminderCalc = course.Tuition / 1 - addEnrolledCourseDto.PaidAmount;
    int paymentPerMonthCalc = course.Tuition / addEnrolledCourseDto.NumberOfPayments;

    EnrolledCourse enrolledCourse = ConvertAddEnrolledCourseDtoToEnrolledCourse(
      addEnrolledCourseDto, course, paymentPerMonthCalc, tuitionReminderCalc
    );

    FilterDefinition<AppUser>? filter = Builders<AppUser>.Filter.Eq(u => u.Id, appUser.Id);
    UpdateDefinition<AppUser>? update = Builders<AppUser>.Update.AddToSet(u => u.EnrolledCourses, enrolledCourse);

    UpdateResult? result = await _collectionAppUser.UpdateOneAsync(
      filter, update, cancellationToken: cancellationToken
    );

    return result.ModifiedCount > 0 ? enrolledCourse : null;
  }

  public async Task<UpdateResult?> UpdateEnrolledCourseAsync(
    UpdateEnrolledDto updateEnrolledDto,
    string targetUserName,
    CancellationToken cancellationToken
  )
  {
    AppUser? appUser = await _collectionAppUser.Find(doc => doc.NormalizedUserName == targetUserName.ToUpper()).
      FirstOrDefaultAsync(cancellationToken);
    if (appUser is null) return null;

    EnrolledCourse? enrolledCourse = appUser.EnrolledCourses.FirstOrDefault(ec => ec.CourseTitle.ToUpper() ==
      updateEnrolledDto.TitleCourse.ToUpper()
    );
    if (enrolledCourse is null) return null;

    int newTotalPaidAmount = enrolledCourse.PaidAmount + updateEnrolledDto.PaidAmount;
    int tuitionReminder = enrolledCourse.CourseTuition - newTotalPaidAmount;
    int newPaidNumber = newTotalPaidAmount / enrolledCourse.PaymentPerMonth;
    int numberOfPaymentsLeft = enrolledCourse.NumberOfPayments - newPaidNumber;

    var newPayment = new Payment(
      ObjectId.GenerateNewId().ToString(),
      updateEnrolledDto.TitleCourse.ToUpper(),
      updateEnrolledDto.PaidAmount,
      DateTime.UtcNow,
      updateEnrolledDto.Method,
      Photo: null
    );

    FilterDefinition<AppUser>? filter = Builders<AppUser>.Filter.And(
      Builders<AppUser>.Filter.Eq(u => u.Id, appUser.Id),
      Builders<AppUser>.Filter.ElemMatch(
        u => u.EnrolledCourses,
        ec => ec.CourseTitle.ToUpper() == updateEnrolledDto.TitleCourse.ToUpper()
      )
    );

    UpdateDefinition<AppUser>? update = Builders<AppUser>.Update.
      Set("EnrolledCourses.$.PaidAmount", newTotalPaidAmount).
      Set("EnrolledCourses.$.TuitionRemainder", tuitionReminder).Set("EnrolledCourses.$.PaidNumber", newPaidNumber).
      Set("EnrolledCourses.$.NumberOfPaymentsLeft", numberOfPaymentsLeft).
      Push("EnrolledCourses.$.Payments", newPayment);

    return await _collectionAppUser.UpdateOneAsync(filter, update, cancellationToken: cancellationToken);
  }

  public async Task<DeleteResult?> DeleteAsync(string targetMemberUserName, CancellationToken cancellationToken)
  {
    ObjectId userId = await _collectionAppUser.AsQueryable().Where(u => u.UserName == targetMemberUserName).
      Select(u => u.Id).FirstOrDefaultAsync(cancellationToken);

    if (userId == default) return null;

    FilterDefinition<AppUser>? filter = Builders<AppUser>.Filter.Eq(u => u.Id, userId);
    return await _collectionAppUser.DeleteOneAsync(filter, cancellationToken);
  }

  public async Task<List<AppUser>> GetAllTeachersAsync(CancellationToken cancellationToken)
  {
    IList<AppUser> teachers = await _userManager.GetUsersInRoleAsync("teacher");
    var pureTeachers = new List<AppUser>();

    foreach (AppUser user in teachers)
      if (!await _userManager.IsInRoleAsync(user, "admin"))
        pureTeachers.Add(user);

    return pureTeachers;
  }

  public async Task<MemberDto?> GetMemberByEmailAsync(string targetMemberEmail, CancellationToken cancellationToken)
  {
    AppUser? appUser = await _userManager.FindByEmailAsync(targetMemberEmail);
    if (appUser is null) return null;

    return ConvertAppUserToMemberDto(appUser, isAbsent: false);
  }

  public async Task<TargetMemberDto?> GetMemberByUserNameAsync(
    string targetUserName, CancellationToken cancellationToken
  )
  {
    AppUser? appUser = await _collectionAppUser.Find(u => u.NormalizedUserName == targetUserName.ToUpper()).
      FirstOrDefaultAsync(cancellationToken);

    if (appUser is null) return null;

    return ConvertAppUserToTargetMemberDto(appUser);
  }

  public async Task<OperationResult<TargetMemberDto>> UpdateMemberAsync(
    string memberUserName, ManagerUpdateMemberDto dto, CancellationToken cancellationToken
  )
  {
    AppUser? targetAppUser = await _collectionAppUser.Find(u => u.NormalizedUserName == memberUserName.ToUpper()).
      FirstOrDefaultAsync(cancellationToken);

    if (targetAppUser is null)
    {
      return new(
        false,
        Error: new(
          ErrorCode.IsUserNotFound,
          "Target user not found"
        )
      );
    }

    List<UpdateDefinition<AppUser>> updateDefinitions = new List<UpdateDefinition<AppUser>>();
    UpdateDefinitionBuilder<AppUser> updateDefinitionBuilder = Builders<AppUser>.Update;

    if (!string.IsNullOrWhiteSpace(dto.Name))
    {
      string trimmed = dto.Name.Trim();
      if (!string.Equals(targetAppUser.Name, trimmed, StringComparison.Ordinal))
      {
        updateDefinitions.Add(updateDefinitionBuilder.Set(appUser => appUser.Name, trimmed));
      }
    }

    if (!string.IsNullOrWhiteSpace(dto.LastName))
    {
      string trimmed = dto.LastName.Trim();
      if (!string.Equals(targetAppUser.LastName, trimmed, StringComparison.Ordinal))
      {
        updateDefinitions.Add(updateDefinitionBuilder.Set(appUser => appUser.LastName, trimmed));
      }
    }

    if (dto.DateOfBirth is not null && targetAppUser.DateOfBirth != dto.DateOfBirth.Value)
    {
      updateDefinitions.Add(updateDefinitionBuilder.Set(appUser => appUser.DateOfBirth, dto.DateOfBirth.Value));
    }

    if (!string.IsNullOrWhiteSpace(dto.PhoneNum))
    {
      string phone = dto.PhoneNum.Trim();

      if (!string.Equals(targetAppUser.PhoneNum, phone, StringComparison.Ordinal))
      {
        updateDefinitions.Add(updateDefinitionBuilder.Set(appUser => appUser.PhoneNum, phone));
      }
    }

    if (!string.IsNullOrWhiteSpace(dto.Gender))
    {
      if (Enum.TryParse<GenderType>(dto.Gender.Trim(), true, out var parsedGender))
      {
        updateDefinitions.Add(updateDefinitionBuilder.Set(appUser => appUser.Gender, parsedGender));
      }
      else
      {
        return new(
          false,
          Error: new CustomError(
            ErrorCode.IsInvalidType,
            "Enter valid gender"
          )
        );
      }
    }

    if (updateDefinitions.Count > 0)
    {
      UpdateDefinition<AppUser> updateDef = Builders<AppUser>.Update.Combine(updateDefinitions);

      UpdateResult updateResult = await _collectionAppUser.UpdateOneAsync(doc => doc.Id == targetAppUser.Id, updateDef, null, cancellationToken);

      AppUser appUser = await _collectionAppUser.Find(doc => doc.Id == targetAppUser.Id).FirstOrDefaultAsync(cancellationToken);

      return new(
        true,
        Mappers.ConvertAppUserToTargetMemberDto(appUser),
        null
      );
    }

    return new(
     false,
     Error: new CustomError(
       ErrorCode.IsOperationFailed,
       "No update was made."
     )
   );
  }

  public async Task<OperationResult<MemberPhoto>> UploadMemberPhotoAsync(IFormFile file, string userName, CancellationToken cancellationToken)
  {
    AppUser? targetAppUser = await _collectionAppUser.Find(u => u.NormalizedUserName == userName.ToUpper()).
      FirstOrDefaultAsync(cancellationToken);

    if (targetAppUser is null)
    {
      return new OperationResult<MemberPhoto>(
        false,
        Error: new CustomError(
          ErrorCode.IsUserNotFound,
          "Target user not found"
        )
      );
    }

    // userId, appUser, file
    // save file in Storage using PhotoService / userId makes the folder name
    string[]? imageUrls = await _photoService.AddMemberPhotoToDiskAsync(file, targetAppUser.Photo, targetAppUser.Id);
    if (imageUrls is not null)
    {
      MemberPhoto photo;

      photo = Mappers.ConvertPhotoUrlsToMemberPhoto(imageUrls);

      UpdateDefinition<AppUser> updatedUser = Builders<AppUser>.Update
        .Set(doc => doc.Photo, photo);

      UpdateResult result = await _collectionAppUser.UpdateOneAsync(doc => doc.Id == targetAppUser.Id, updatedUser, null, cancellationToken);

      return new OperationResult<MemberPhoto>(
        true,
        photo,
        null
      );
    }

    return new OperationResult<MemberPhoto>(
      false,
      Error: new CustomError(
        ErrorCode.IsOperationFailed,
        "Operation failed. Try agian or contact support."
      )
    );
  }

  public async Task<Photo?> AddPhotoAsync(IFormFile file, string targetPaymentId, CancellationToken cancellationToken)
  {
    AppUser? appUser = await _collectionAppUser.
      Find(u => u.EnrolledCourses.Any(ec => ec.Payments.Any(p => p.Id == targetPaymentId))).
      FirstOrDefaultAsync(cancellationToken);
    if (appUser is null) return null;

    EnrolledCourse? enrolledCourse =
      appUser.EnrolledCourses.FirstOrDefault(ec => ec.Payments.Any(p => p.Id == targetPaymentId));
    if (enrolledCourse is null) return null;

    Payment? payment = enrolledCourse.Payments.FirstOrDefault(p => p.Id == targetPaymentId);
    if (payment is null) return null;

    bool isSuccess = ObjectId.TryParse(payment.Id, out ObjectId targetPaymentIdObjectId);
    if (!isSuccess) return null;
    string[]? imageUrls = await _photoService.AddPhotoToDiskAsync(file, targetPaymentIdObjectId);
    if (imageUrls is null) throw new ArgumentNullException("Saving photo has failed. Error from PhotoService.");

    Photo photo = ConvertPhotoUrlsToPhoto(imageUrls.ToArray(), isMain: true);

    Payment updatedPayment = payment with { Photo = photo };

    FilterDefinition<AppUser>? filter = Builders<AppUser>.Filter.Eq(u => u.Id, appUser.Id);
    UpdateDefinition<AppUser>? update = Builders<AppUser>.Update.Set(
      "EnrolledCourses.$[ec].Payments.$[p]", updatedPayment
    );

    var arrayFilters = new List<ArrayFilterDefinition>
    {
      new BsonDocumentArrayFilterDefinition<BsonDocument>(
        new BsonDocument("ec.CourseTitle", enrolledCourse.CourseTitle)
      ),
      new BsonDocumentArrayFilterDefinition<BsonDocument>(new BsonDocument("p._id", updatedPayment.Id))
    };

    UpdateResult? result = await _collectionAppUser.UpdateOneAsync(
      filter, update, new UpdateOptions { ArrayFilters = arrayFilters }, cancellationToken
    );

    return result.ModifiedCount > 0 ? photo : null;
  }

  public async Task<bool> DeletePhotoAsync(string targetPaymentId, CancellationToken cancellationToken)
  {
    AppUser? appUser = await _collectionAppUser.
      Find(u => u.EnrolledCourses.Any(ec => ec.Payments.Any(p => p.Id == targetPaymentId))).
      FirstOrDefaultAsync(cancellationToken);
    if (appUser is null) return false;

    EnrolledCourse? enrolledCourse =
      appUser.EnrolledCourses.FirstOrDefault(ec => ec.Payments.Any(p => p.Id == targetPaymentId));
    if (enrolledCourse is null) return false;

    Payment? payment = enrolledCourse.Payments.FirstOrDefault(p => p.Id == targetPaymentId);
    if (payment is null || payment.Photo is null) return false;

    bool isDeleteSuccess = await _photoService.DeletePhotoFromDisk(payment.Photo);
    if (!isDeleteSuccess) return false;

    Payment updatedPayment = payment with { Photo = null };

    FilterDefinition<AppUser>? filter = Builders<AppUser>.Filter.Eq(u => u.Id, appUser.Id);
    UpdateDefinition<AppUser>? update = Builders<AppUser>.Update.Set(
      "EnrolledCourses.$[ec].Payments.$[p]", updatedPayment
    );

    var arrayFilters = new List<ArrayFilterDefinition>
    {
      new BsonDocumentArrayFilterDefinition<BsonDocument>(
        new BsonDocument("ec.CourseTitle", enrolledCourse.CourseTitle)
      ),
      new BsonDocumentArrayFilterDefinition<BsonDocument>(new BsonDocument("p._id", payment.Id))
    };

    UpdateResult? result = await _collectionAppUser.UpdateOneAsync(
      filter, update, new UpdateOptions { ArrayFilters = arrayFilters }, cancellationToken
    );

    return result.ModifiedCount > 0;
  }

  public async Task<List<CourseResponse>> GetTargetMemberCourseAsync(
    string targetUserName, CancellationToken cancellationToken
  )
  {
    List<string>? enrolledCourseIds = await _collectionAppUser.AsQueryable().
      Where(u => u.NormalizedUserName == targetUserName.ToUpper()).SelectMany(u => u.EnrolledCourses).
      Select(ec => ec.CourseId.ToString()).ToListAsync(cancellationToken);

    if (enrolledCourseIds is null || enrolledCourseIds.Count == 0) return new List<CourseResponse>();

    List<Course> courses = await _collectionCourse.Find(doc => enrolledCourseIds.Contains(doc.Id.ToString())).
      ToListAsync(cancellationToken);

    List<string> userNames = [];
    List<string> names = [];
    List<CourseResponse> coursesRes = [];

    foreach (var course in courses)
    {
      userNames = await _courseRepository.GetProfessorUserNamesByIdsAsync(course.ProfessorsIds, cancellationToken);
      names = await _courseRepository.GetProfessorNamesByIdsAsync(course.ProfessorsIds, cancellationToken);

      coursesRes.Add(Mappers.ConvertCourseToCourseRes(course, userNames, names));
    }

    return coursesRes ?? new List<CourseResponse>();
  }

  public async Task<EnrolledCourse?> GetTargetMemberEnrolledCourseAsync(
    string targetUserName, string courseTitle, CancellationToken cancellationToken
  )
  {
    AppUser? appUser = await _collectionAppUser.Find(doc => doc.NormalizedUserName == targetUserName.ToUpper()).
      FirstOrDefaultAsync(cancellationToken);
    if (appUser is null) return null;

    return appUser.EnrolledCourses.FirstOrDefault(ec => ec.CourseTitle == courseTitle.ToUpper());
  }

  public async Task<Payment?> GetTargetPaymentByIdAsync(string targetPaymentId, CancellationToken cancellationToken)
  {
    AppUser? appUser = await _collectionAppUser.
      Find(doc => doc.EnrolledCourses.Any(ec => ec.Payments.Any(p => p.Id == targetPaymentId))).
      FirstOrDefaultAsync(cancellationToken);
    if (appUser is null) return null;

    EnrolledCourse? enrolledCourse =
      appUser.EnrolledCourses.FirstOrDefault(ec => ec.Payments.Any(p => p.Id == targetPaymentId));
    if (enrolledCourse is null) return null;

    return enrolledCourse.Payments.FirstOrDefault(p => p.Id == targetPaymentId);
  }

  public async Task<List<string>> GetTargetCourseTitleAsync(string targetUserName, CancellationToken cancellationToken)
  {
    List<string>? courseTitles = await _collectionAppUser.AsQueryable().
      Where(u => u.NormalizedUserName == targetUserName.ToUpper()).SelectMany(u => u.EnrolledCourses).
      Select(ec => ec.CourseTitle.ToUpper()).ToListAsync(cancellationToken);

    return courseTitles ?? new List<string>();
  }

  public async Task<PagedList<Attendence>> GetAllAttendenceAsync(
    AttendenceParams attendenceParams,
    string targetMemberUserName,
    string targetCourseTitle,
    CancellationToken cancellationToken
  )
  {
    AppUser? appUser = await _collectionAppUser.Find(doc => doc.NormalizedUserName == targetMemberUserName.ToUpper()).
      FirstOrDefaultAsync(cancellationToken);
    if (appUser is null)
    {
      var emptyQuery = _collectionAttendence.AsQueryable().Where(_ => false);
      return await PagedList<Attendence>.CreatePagedListAsync(
          emptyQuery, attendenceParams.PageNumber, attendenceParams.PageSize, cancellationToken);
    }

    ObjectId targetCourseId = await _collectionCourse.AsQueryable().
      Where(doc => doc.Title == targetCourseTitle.ToUpper()).Select(doc => doc.Id).
      FirstOrDefaultAsync(cancellationToken);
    if (targetCourseId == default)
    {
      var emptyQuery = _collectionAttendence.AsQueryable().Where(_ => false);
      return await PagedList<Attendence>.CreatePagedListAsync(
          emptyQuery, attendenceParams.PageNumber, attendenceParams.PageSize, cancellationToken);
    }

    IQueryable<Attendence>? query = _collectionAttendence.AsQueryable().
      Where(doc => doc.StudentId == appUser.Id && doc.CourseId == targetCourseId);

    return await PagedList<Attendence>.CreatePagedListAsync(
      query, attendenceParams.PageNumber, attendenceParams.PageSize, cancellationToken
    );
  }

  private IQueryable<AppUser> CreateQuery(MemberParams memberParams)
  {
    DateOnly minDob = DateOnly.FromDateTime(DateTime.Today.AddYears(-memberParams.MaxAge - 1));
    DateOnly maxDob = DateOnly.FromDateTime(DateTime.Today.AddYears(-memberParams.MinAge));

    IQueryable<AppUser>? query = _collectionAppUser.AsQueryable();

    if (!string.IsNullOrWhiteSpace(memberParams.Search))
    {
      string s = memberParams.Search.ToUpper();
      query = query.Where(u =>
          (u.Name ?? string.Empty).ToUpper().Contains(s) ||
          (u.NormalizedUserName ?? string.Empty).Contains(s) ||
          (u.LastName ?? string.Empty).ToUpper().Contains(s) ||
           u.EnrolledCourses.Any(c =>
                (c.CourseTitle ?? string.Empty).ToUpper().Contains(s)
            ));
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
      newUserName = Utils.GenerateComplexUsername(length: 8);
      exists = await _collectionAppUser.Find(u => u.UserName == newUserName).AnyAsync(cancellationToken);
    } while (exists);

    return newUserName;
  }

  public async Task<AppUser?> GetByIdAsync(ObjectId? userId, CancellationToken cancellationToken)
  {
    if (userId is null) return null;

    return await _collectionAppUser.Find(doc => doc.Id == userId).SingleOrDefaultAsync(cancellationToken);
  }

  public async Task<ObjectId?> GetObjectIdByUserNameAsync(string userName, CancellationToken cancellationToken)
  {
    ObjectId userId = await _collectionAppUser.AsQueryable().Where(u => u.NormalizedUserName == userName.ToUpper()).
      Select(u => u.Id).SingleOrDefaultAsync(cancellationToken);

    return ValidationsExtensions.ValidateObjectId(userId);
  }

  #region Vars and Constructor

  private readonly IMongoCollection<AppUser> _collectionAppUser;
  private readonly IMongoCollection<Course> _collectionCourse;
  private readonly IMongoCollection<Attendence> _collectionAttendence;
  private readonly UserManager<AppUser> _userManager;
  private readonly ITokenService _tokenService;
  private readonly IMongoClient _client;
  private readonly IPhotoService _photoService;
  private readonly ICourseRepository _courseRepository;

  public ManagerRepository(
    IMongoClient client,
    ITokenService tokenService,
    IMyMongoDbSettings dbSettings,
    UserManager<AppUser> userManager,
    IPhotoService photoService,
    ICourseRepository courseRepository
  )
  {
    _client = client; // used for Session
    IMongoDatabase? database = client.GetDatabase(dbSettings.DatabaseName);

    _collectionAppUser = database.GetCollection<AppUser>(AppVariablesExtensions.CollectionUsers);
    _collectionCourse = database.GetCollection<Course>(AppVariablesExtensions.CollectionCourses);
    _collectionAttendence = database.GetCollection<Attendence>(AppVariablesExtensions.CollectionAttendences);

    _userManager = userManager;
    _tokenService = tokenService;
    _photoService = photoService;
    _courseRepository = courseRepository;
  }

  #endregion
}
