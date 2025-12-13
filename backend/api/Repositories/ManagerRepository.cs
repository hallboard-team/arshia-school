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
          ErrorCode.IsNotFound,
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

  public async Task<EnrolledClass?> AddEnrolledClassAsync(
    AddEnrolledCourseDto addEnrolledCourseDto,
    string targetUserName,
    CancellationToken cancellationToken
  )
  {
    if (addEnrolledCourseDto.NumberOfPayments <= 0) return null;

    AppUser? appUser = await _collectionAppUser.Find(doc => doc.NormalizedUserName == targetUserName.ToUpper()).
      FirstOrDefaultAsync(cancellationToken);
    if (appUser is null) return null;

    Class? targetClass = await _collectionClass.Find(doc => doc.ClassName.ToUpper() == addEnrolledCourseDto.ClassName.ToUpper()).
      FirstOrDefaultAsync(cancellationToken);
    if (targetClass is null) return null;

    bool alreadyEnrolledAdded = appUser.EnrolledClasses.Any(doc => doc.ClassId == targetClass.Id);
    if (alreadyEnrolledAdded) return null;

    int tuition = targetClass.Tuition;                       // شهریه کل (int)
    int paidAmount = addEnrolledCourseDto.PaidAmount;   // پیش‌پرداخت (int)

    // مبلغ باقی‌مانده بعد از پیش‌پرداخت
    int tuitionReminderCalc = tuition - paidAmount;
    if (tuitionReminderCalc < 0)
      tuitionReminderCalc = 0;

    int paymentPerMonthCalc = 0;
    int lastpaymentPerMonthCalc = 0;

    if (tuitionReminderCalc > 0 && addEnrolledCourseDto.NumberOfPayments > 0)
    {
      int n = addEnrolledCourseDto.NumberOfPayments;

      // مبلغ پایه هر قسط
      paymentPerMonthCalc = tuitionReminderCalc / n;

      // باقیمانده‌ی تقسیم که باید روی قسط آخر اعمال شود
      int remainder = tuitionReminderCalc % n;

      // قسط آخر = قسط پایه + باقیمانده
      lastpaymentPerMonthCalc = paymentPerMonthCalc + remainder;
    }

    EnrolledClass enrolledCourse = ConvertAddEnrolledCourseDtoToEnrolledCourse(
      addEnrolledCourseDto, targetClass, paymentPerMonthCalc, lastpaymentPerMonthCalc, tuitionReminderCalc
    );

    FilterDefinition<AppUser>? filter = Builders<AppUser>.Filter.Eq(u => u.Id, appUser.Id);
    UpdateDefinition<AppUser>? update = Builders<AppUser>.Update.AddToSet(u => u.EnrolledClasses, enrolledCourse);

    UpdateResult? result = await _collectionAppUser.UpdateOneAsync(
      filter, update, cancellationToken: cancellationToken
    );

    return result.ModifiedCount > 0 ? enrolledCourse : null;
  }

  public async Task<UpdateResult?> UpdateEnrolledClassAsync(
    UpdateEnrolledDto updateEnrolledDto,
    string targetUserName,
    CancellationToken cancellationToken
  )
  {
    AppUser? appUser = await _collectionAppUser.Find(doc => doc.NormalizedUserName == targetUserName.ToUpper()).
      FirstOrDefaultAsync(cancellationToken);

    if (appUser is null) return null;

    Class targetClass = await _collectionClass.Find(doc => doc.ClassName.ToUpper() == updateEnrolledDto.ClassName.ToUpper()).FirstOrDefaultAsync(cancellationToken);

    EnrolledClass? enrolledClass = appUser.EnrolledClasses.FirstOrDefault(ec => ec.ClassId == targetClass.Id);

    if (enrolledClass is null) return null;

    int newTotalPaidAmount = enrolledClass.PaidAmount + updateEnrolledDto.PaidAmount;
    int tuitionReminder = targetClass.Tuition - newTotalPaidAmount;
    int newPaidNumber = newTotalPaidAmount / enrolledClass.PaymentPerMonth;
    int numberOfPaymentsLeft = enrolledClass.NumberOfPayments - newPaidNumber;

    var newPayment = new Payment(
      ObjectId.GenerateNewId(),
      updateEnrolledDto.ClassName.ToUpper(),
      updateEnrolledDto.PaidAmount,
      DateTime.UtcNow,
      updateEnrolledDto.Method,
      Photo: null
    );

    FilterDefinition<AppUser>? filter = Builders<AppUser>.Filter.And(
      Builders<AppUser>.Filter.Eq(u => u.Id, appUser.Id),
      Builders<AppUser>.Filter.ElemMatch(
        u => u.EnrolledClasses,
        ec => ec.ClassId == targetClass.Id
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

    List<AppRole> appRoles = await GetAllRoleAsync(cancellationToken);
    Dictionary<ObjectId, string?> roleIdsToName = appRoles.ToDictionary(r => r.Id, r => r.Name);

    return ConvertAppUserToMemberDto(appUser, isAbsent: false, roleIdsToName!);
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

  public async Task<TargetMemberDto?> UpdateMemberAsync(
       string memberUserName,
       ManagerUpdateMemberDto updatedMember,
       CancellationToken cancellationToken
   )
  {
    AppUser? targetAppUser = await _collectionAppUser
        .Find(u => u.NormalizedUserName == memberUserName.ToUpper())
        .FirstOrDefaultAsync(cancellationToken);

    if (targetAppUser is null) return null;

    var builder = Builders<AppUser>.Update;
    var updateDefinitions = new List<UpdateDefinition<AppUser>>();

    if (!string.Equals(targetAppUser.Name, updatedMember.Name, StringComparison.Ordinal))
      updateDefinitions.Add(builder.Set(u => u.Name, updatedMember.Name));

    if (!string.Equals(targetAppUser.LastName, updatedMember.LastName, StringComparison.Ordinal))
      updateDefinitions.Add(builder.Set(u => u.LastName, updatedMember.LastName));

    if (!string.Equals(targetAppUser.PhoneNum, updatedMember.PhoneNum, StringComparison.Ordinal))
      updateDefinitions.Add(builder.Set(u => u.PhoneNum, updatedMember.PhoneNum));

    if (targetAppUser.DateOfBirth != updatedMember.DateOfBirth)
      updateDefinitions.Add(builder.Set(u => u.DateOfBirth, updatedMember.DateOfBirth));

    if (!string.IsNullOrWhiteSpace(updatedMember.Gender))
    {
      if (Enum.TryParse<GenderType>(updatedMember.Gender.Trim(), true, out var parsedGender))
      {
        updateDefinitions.Add(builder.Set(u => u.Gender, parsedGender));
      }
      else
      {
        return null;
      }
    }

    if (updateDefinitions.Count > 0)
    {
      var filter = Builders<AppUser>.Filter.Eq(u => u.Id, targetAppUser.Id);
      var combinedUpdate = builder.Combine(updateDefinitions);

      await _collectionAppUser.UpdateOneAsync(filter, combinedUpdate, cancellationToken: cancellationToken);
    }

    AppUser? updatedAppUser = await _collectionAppUser
        .Find(u => u.NormalizedUserName == memberUserName.ToUpper())
        .FirstOrDefaultAsync(cancellationToken);

    return updatedAppUser is null ? null : Mappers.ConvertAppUserToTargetMemberDto(updatedAppUser);
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
          ErrorCode.IsNotFound,
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

  public async Task<Photo?> AddPhotoAsync(IFormFile file, ObjectId targetPaymentId, CancellationToken cancellationToken)
  {
    AppUser? appUser = await _collectionAppUser.
      Find(u => u.EnrolledClasses.Any(ec => ec.Payments.Any(p => p.Id == targetPaymentId))).
      FirstOrDefaultAsync(cancellationToken);

    if (appUser is null) return null;

    EnrolledClass? enrolledCourse =
      appUser.EnrolledClasses.FirstOrDefault(ec => ec.Payments.Any(p => p.Id == targetPaymentId));
    if (enrolledCourse is null) return null;

    Payment? payment = enrolledCourse.Payments.FirstOrDefault(p => p.Id == targetPaymentId);
    if (payment is null) return null;

    string[]? imageUrls = await _photoService.AddPhotoToDiskAsync(file, payment.Id);
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
        new BsonDocument("ec.ClassId", enrolledCourse.ClassId)
      ),
      new BsonDocumentArrayFilterDefinition<BsonDocument>(new BsonDocument("p._id", updatedPayment.Id))
    };

    UpdateResult? result = await _collectionAppUser.UpdateOneAsync(
      filter, update, new UpdateOptions { ArrayFilters = arrayFilters }, cancellationToken
    );

    return result.ModifiedCount > 0 ? photo : null;
  }

  public async Task<bool> DeletePhotoAsync(ObjectId targetPaymentId, CancellationToken cancellationToken)
  {
    AppUser? appUser = await _collectionAppUser.
      Find(u => u.EnrolledClasses.Any(ec => ec.Payments.Any(p => p.Id == targetPaymentId))).
      FirstOrDefaultAsync(cancellationToken);
    if (appUser is null) return false;

    EnrolledClass? enrolledCourse =
      appUser.EnrolledClasses.FirstOrDefault(ec => ec.Payments.Any(p => p.Id == targetPaymentId));
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
        new BsonDocument("ec.ClassId", enrolledCourse.ClassId)
      ),
      new BsonDocumentArrayFilterDefinition<BsonDocument>(new BsonDocument("p._id", payment.Id))
    };

    UpdateResult? result = await _collectionAppUser.UpdateOneAsync(
      filter, update, new UpdateOptions { ArrayFilters = arrayFilters }, cancellationToken
    );

    return result.ModifiedCount > 0;
  }

  public async Task<List<ShowClassDto>> GetTargetMemberClassAsync(
    string targetUserName, CancellationToken cancellationToken
  )
  {
    List<string>? enrolledClassIds = await _collectionAppUser.AsQueryable().
      Where(u => u.NormalizedUserName == targetUserName.ToUpper()).SelectMany(u => u.EnrolledClasses).
      Select(ec => ec.ClassId.ToString()).ToListAsync(cancellationToken);

    if (enrolledClassIds is null || enrolledClassIds.Count == 0) return new List<ShowClassDto>();

    List<Class> classes = await _collectionClass.Find(doc => enrolledClassIds.Contains(doc.Id.ToString())).
      ToListAsync(cancellationToken);

    List<string> userNames = [];
    List<string> names = [];
    List<ShowClassDto> classRes = [];

    foreach (var model in classes)
    {
      userNames = await _classRepository.GetProfessorUserNamesByIdsAsync(model.ProfessorsIds, cancellationToken);
      names = await _classRepository.GetProfessorNamesByIdsAsync(model.ProfessorsIds, cancellationToken);

      OperationResult<ShowCourseDto> courseDto = await _courseRepository.GetCourseByIdAsync(model.CourseId!.Value, cancellationToken);
      OperationResult<ShowSiteDto> siteDto = await _siteRepository.GetSiteByIdAsync(model.SiteId!.Value, cancellationToken);

      classRes.Add(Mappers.ConvertClassToShowClassDto(model, courseDto.Result, siteDto.Result, userNames, names));
    }

    return classRes ?? [];
  }

  public async Task<EnrolledClass?> GetTargetMemberEnrolledClassAsync(
    string targetUserName, string classTitle, CancellationToken cancellationToken
  )
  {
    AppUser? appUser = await _collectionAppUser.Find(doc => doc.NormalizedUserName == targetUserName.ToUpper()).
      FirstOrDefaultAsync(cancellationToken);

    if (appUser is null) return null;

    Class? targetClass = await _collectionClass.Find(doc => doc.ClassName.ToUpper() == classTitle.ToUpper()).FirstOrDefaultAsync(cancellationToken);

    return appUser.EnrolledClasses.FirstOrDefault(ec => ec.ClassId == targetClass.Id);
  }

  public async Task<Payment?> GetTargetPaymentByIdAsync(ObjectId targetPaymentId, CancellationToken cancellationToken)
  {
    AppUser? appUser = await _collectionAppUser.
      Find(doc => doc.EnrolledClasses.Any(ec => ec.Payments.Any(p => p.Id == targetPaymentId))).
      FirstOrDefaultAsync(cancellationToken);
    if (appUser is null) return null;

    EnrolledClass? enrolledCourse =
      appUser.EnrolledClasses.FirstOrDefault(ec => ec.Payments.Any(p => p.Id == targetPaymentId));
    if (enrolledCourse is null) return null;

    return enrolledCourse.Payments.FirstOrDefault(p => p.Id == targetPaymentId);
  }

  public async Task<List<string>> GetTargetClassTitleAsync(string targetUserName, CancellationToken cancellationToken)
  {
    List<ObjectId>? classIds = await _collectionAppUser.AsQueryable().
      Where(u => u.NormalizedUserName == targetUserName.ToUpper()).SelectMany(u => u.EnrolledClasses).
      Select(ec => ec.ClassId).ToListAsync(cancellationToken);

    List<string> classNames = await _collectionClass
      .Find(c => classIds.Contains(c.Id))
      .Project(c => c.ClassName ?? string.Empty)
      .ToListAsync(cancellationToken);

    return classNames ?? new List<string>();
  }

  public async Task<PagedList<Attendance>> GetAllAttendenceAsync(
    AttendenceParams attendenceParams,
    string targetMemberUserName,
    string targetClassTitle,
    CancellationToken cancellationToken
  )
  {
    AppUser? appUser = await _collectionAppUser.Find(doc => doc.NormalizedUserName == targetMemberUserName.ToUpper()).
      FirstOrDefaultAsync(cancellationToken);
    if (appUser is null)
    {
      var emptyQuery = _collectionAttendence.AsQueryable().Where(_ => false);
      return await PagedList<Attendance>.CreatePagedListAsync(
          emptyQuery, attendenceParams.PageNumber, attendenceParams.PageSize, cancellationToken);
    }

    ObjectId targetCourseId = await _collectionClass.AsQueryable().
      Where(doc => doc.ClassName == targetClassTitle.ToUpper()).Select(doc => doc.Id).
      FirstOrDefaultAsync(cancellationToken);
    if (targetCourseId == default)
    {
      var emptyQuery = _collectionAttendence.AsQueryable().Where(_ => false);
      return await PagedList<Attendance>.CreatePagedListAsync(
          emptyQuery, attendenceParams.PageNumber, attendenceParams.PageSize, cancellationToken);
    }

    IQueryable<Attendance>? query = _collectionAttendence.AsQueryable().
      Where(doc => doc.StudentId == appUser.Id && doc.ClassId == targetCourseId);

    return await PagedList<Attendance>.CreatePagedListAsync(
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
          (u.LastName ?? string.Empty).ToUpper().Contains(s));
    }

    if (!string.IsNullOrWhiteSpace(memberParams.CourseTitle))
    {
      string s = memberParams.CourseTitle.ToUpper();

      var targetCourseIds = _collectionCourse.AsQueryable()
             .Where(c => c.Title.ToUpper().Contains(s))
             .Select(c => c.Id)
             .ToList();

      var targetClassIds = _collectionClass.AsQueryable()
            .Where(c => targetCourseIds.Contains(c.CourseId!.Value))
            .Select(c => c.Id)
            .ToList();

      query = query.Where(u =>
      u.EnrolledClasses.Any(ec => targetClassIds.Contains(ec.ClassId)));
    }

    if (!string.IsNullOrWhiteSpace(memberParams.ClassName))
    {
      string s = memberParams.ClassName.ToUpper();

      var targetClassIds = _collectionClass.AsQueryable()
             .Where(c => c.ClassName.ToUpper().Contains(s))
             .Select(c => c.Id)
             .ToList();

      query = query.Where(u =>
            u.EnrolledClasses.Any(ec => targetClassIds.Contains(ec.ClassId)));
    }

    if (memberParams.Roles is not null)
    {
      var roleNames = memberParams.Roles
        .Where(r => !string.IsNullOrWhiteSpace(r))
        .Select(r => r.Trim().ToUpper())
        .ToList();

      if (roleNames.Count > 0)
      {
        List<ObjectId> roleIds = _collectionRole.AsQueryable()
          .Where(r => roleNames.Contains(r.NormalizedName!))
          .Select(r => r.Id)
          .ToList();

        if (roleIds.Count > 0)
        {
          query = query.Where(u => u.Roles.Any(rId => roleIds.Contains(rId)));
        }
      }
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

  public async Task<List<AppRole>> GetAllRoleAsync(CancellationToken cancellationToken)
  {
    return await _collectionRole.Find(_ => true).ToListAsync();
  }

  #region Vars and Constructor

  private readonly IMongoCollection<AppUser> _collectionAppUser;
  private readonly IMongoCollection<Course> _collectionCourse;
  private readonly IMongoCollection<Attendance> _collectionAttendence;
  private readonly IMongoCollection<AppRole> _collectionRole;
  private readonly IMongoCollection<Class> _collectionClass;
  private readonly UserManager<AppUser> _userManager;
  private readonly ITokenService _tokenService;
  private readonly IMongoClient _client;
  private readonly IPhotoService _photoService;
  private readonly ICourseRepository _courseRepository;
  private readonly IClassRepository _classRepository;
  private readonly ISiteRepository _siteRepository;

  public ManagerRepository(
    IMongoClient client,
    ITokenService tokenService,
    IMyMongoDbSettings dbSettings,
    UserManager<AppUser> userManager,
    IPhotoService photoService,
    ICourseRepository courseRepository,
    IClassRepository classRepository,
    ISiteRepository siteRepository
  )
  {
    _client = client; // used for Session
    IMongoDatabase? database = client.GetDatabase(dbSettings.DatabaseName);

    _collectionAppUser = database.GetCollection<AppUser>(AppVariablesExtensions.CollectionUsers);
    _collectionCourse = database.GetCollection<Course>(AppVariablesExtensions.CollectionCourses);
    _collectionAttendence = database.GetCollection<Attendance>(AppVariablesExtensions.CollectionAttendences);
    _collectionRole = database.GetCollection<AppRole>(AppVariablesExtensions.CollectionRoles);
    _collectionClass = database.GetCollection<Class>(AppVariablesExtensions.CollectionClasses);

    _userManager = userManager;
    _tokenService = tokenService;
    _photoService = photoService;
    _courseRepository = courseRepository;
    _classRepository = classRepository;
    _siteRepository = siteRepository;
  }

  #endregion
}
