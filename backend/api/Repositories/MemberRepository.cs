using api.DTOs.Account;
using api.DTOs.Helpers;

namespace api.Repositories;

public class MemberRepository : IMemberRepository
{
    #region Constructor
    IMongoCollection<AppUser> _collectionAppUser;
    IMongoCollection<Attendance> _collectionAttendence;
    IMongoCollection<ClassRoom> _collectionClass;
    private readonly ITokenService _tokenService;
    private readonly UserManager<AppUser> _userManager;

    public MemberRepository(IMongoClient client, IMyMongoDbSettings dbSettings, ITokenService tokenService, UserManager<AppUser> userManager)
    {
        var database = client.GetDatabase(dbSettings.DatabaseName);
        _collectionAppUser = database.GetCollection<AppUser>(AppVariablesExtensions.CollectionUsers);
        _collectionAttendence = database.GetCollection<Attendance>(AppVariablesExtensions.CollectionAttendences);
        _collectionClass = database.GetCollection<ClassRoom>(AppVariablesExtensions.CollectionCourses);

        _tokenService = tokenService;
        _userManager = userManager;
    }
    #endregion Constructor

    public async Task<OperationResult<PagedList<Attendance>>> GetAllAttendenceAsync(AttendanceParams attendanceParams, ObjectId? userId, string targetClassTitle, CancellationToken cancellationToken)
    {
        string cleanClassRoomName = targetClassTitle.Normalize();

        FindOptions options = new()
        {
            Collation = new Collation("en", strength: CollationStrength.Secondary)
        };

        AppUser? appUser = await _collectionAppUser.Find<AppUser>(
            doc => doc.Id == userId).FirstOrDefaultAsync(cancellationToken);
        if (appUser is null)
        {
            return new(
                false,
                Error: new(
                    ErrorCode.IsUserNotFound,
                    "User not found"
                )
            );
        }

        ObjectId? targetClassId = await _collectionClass
            .Find(doc => doc.ClassRoomName == cleanClassRoomName, options)
            .Project(doc => doc.Id)
            .FirstOrDefaultAsync(cancellationToken);

        if (targetClassId == default)
        {
            return new(
                false,
                Error: new(
                    ErrorCode.IsClassRoomNotFound,
                    "Class not found"
                )
            );
        }

        IQueryable<Attendance>? query = _collectionAttendence.AsQueryable<Attendance>()
            .Where(doc => doc.StudentId == appUser.Id && doc.ClassId == targetClassId);

        PagedList<Attendance> attendances = await PagedList<Attendance>.CreatePagedListAsync(query, attendanceParams.PageNumber, attendanceParams.PageSize, cancellationToken);

        return new(
            true,
            attendances,
            null
        );
    }

    public async Task<OperationResult<TargetMemberDto>> UpdateMemberAsync(MemberUpdateDto memberUpdateDto, ObjectId userId, CancellationToken cancellationToken)
    {
        AppUser? targetAppUser = await _userManager.FindByIdAsync(userId.ToString());
        if (targetAppUser == null)
        {
            return new(
                false,
                Error: new(
                    ErrorCode.IsNotFound,
                    "User not found"
                )
            );
        }

        List<UpdateDefinition<AppUser>> updateDefinitions = new List<UpdateDefinition<AppUser>>();
        UpdateDefinitionBuilder<AppUser> updateDefinitionBuilder = Builders<AppUser>.Update;

        if (!string.IsNullOrWhiteSpace(memberUpdateDto.Name))
        {
            string normalizedName = memberUpdateDto.Name.ToNormalized();
            if (!string.Equals(targetAppUser.Name, normalizedName, StringComparison.Ordinal))
            {
                updateDefinitions.Add(updateDefinitionBuilder.Set(appUser => appUser.Name, normalizedName));
            }
        }

        if (!string.IsNullOrWhiteSpace(memberUpdateDto.LastName))
        {
            string normalizedLastName = memberUpdateDto.LastName.ToNormalized();
            if (!string.Equals(targetAppUser.LastName, normalizedLastName, StringComparison.Ordinal))
            {
                updateDefinitions.Add(updateDefinitionBuilder.Set(appUser => appUser.LastName, normalizedLastName));
            }
        }

        if (memberUpdateDto.DateOfBirth is not null && targetAppUser.DateOfBirth != memberUpdateDto.DateOfBirth.Value)
        {
            updateDefinitions.Add(updateDefinitionBuilder.Set(appUser => appUser.DateOfBirth, memberUpdateDto.DateOfBirth.Value));
        }

        if (!string.IsNullOrWhiteSpace(memberUpdateDto.PhoneNum))
        {
            string phone = memberUpdateDto.PhoneNum.Trim();

            if (!string.Equals(targetAppUser.PhoneNum, phone, StringComparison.Ordinal))
            {
                updateDefinitions.Add(updateDefinitionBuilder.Set(appUser => appUser.PhoneNum, phone));
            }
        }

        if (!string.IsNullOrWhiteSpace(memberUpdateDto.Gender))
        {
            if (Enum.TryParse<GenderType>(memberUpdateDto.Gender.Trim(), true, out var parsedGender))
            {
                updateDefinitions.Add(updateDefinitionBuilder.Set(appUser => appUser.Gender, parsedGender));
            }
            else
            {
                return new(
                    false,
                    Error: new(
                        ErrorCode.IsInvalidType,
                        "Enter valid gender."
                    )
                );
            }
        }

        if (updateDefinitions.Count > 0)
        {
            UpdateDefinition<AppUser> updateDef = Builders<AppUser>.Update.Combine(updateDefinitions);

            UpdateResult updateResult = await _collectionAppUser.UpdateOneAsync(doc => doc.Id == userId, updateDef, null, cancellationToken);

            AppUser? appUser = await _userManager.FindByIdAsync(userId.ToString());

            return new(
                true,
                Mappers.ConvertAppUserToTargetMemberDto(appUser!),
                null
            );
        }

        return new(
            false,
            Error: new(
                ErrorCode.IsOperationFailed,
                "No update was made."
            )
        );
    }

    public async Task<OperationResult<ProfileDto>> GetProfileAsync(string hashedUserId, CancellationToken cancellationToken)
    {
        ObjectId? userId = await _tokenService.GetActualUserIdAsync(hashedUserId, cancellationToken);

        AppUser appUser = await _collectionAppUser.Find<AppUser>(appUser => appUser.Id == userId).
            FirstOrDefaultAsync(cancellationToken);

        if (appUser is null)
        {
            return new(
                false,
                Error: new(
                    ErrorCode.IsUserNotFound,
                    "User not found"
                )
            );
        }

        return new(
            true,
            Mappers.ConvertAppUserToProfileDto(appUser),
            null
        );
    }

    public async Task<OperationResult<List<ClassRoom>>> GetClassesAsync(string hashedUserId, CancellationToken cancellationToken)
    {
        ObjectId? userId = await _tokenService.GetActualUserIdAsync(hashedUserId, cancellationToken);

        FindOptions options = new()
        {
            Collation = new Collation("en", strength: CollationStrength.Secondary)
        };

        if (userId is null)
        {
            return new(
                false,
                Error: new(
                    ErrorCode.IsInvalidUserReference,
                    "User id not found in token"
                )
            );
        }

        string? loggedInUserName = await _collectionAppUser.AsQueryable()
            .Where(doc => doc.Id == userId)
            .Select(doc => doc.NormalizedUserName)
            .FirstOrDefaultAsync(cancellationToken);

        if (loggedInUserName is null)
        {
            return new(
                false,
                Error: new(
                    ErrorCode.IsNotFound,
                    "Logged in user, user name not found"
                )
            );
        }

        var enrolledClassIds = await _collectionAppUser
            .Find(doc => doc.NormalizedUserName == loggedInUserName, options)
            .Project(doc => doc.EnrolledClasses.Select(c => c.ClassRoomId))
            .FirstOrDefaultAsync(cancellationToken);

        if (enrolledClassIds is null || !enrolledClassIds.Any())
            return new(
                false,
                Error: new(
                    ErrorCode.IsClassRoomNotFound,
                    "No classes found for this user"
                )
            );

        List<ClassRoom>? courses = await _collectionClass.Find<ClassRoom>(doc =>
            enrolledClassIds.Contains(doc.Id)).ToListAsync(cancellationToken);

        return new(
            true,
            courses,
            null
        );
    }

    public async Task<OperationResult<EnrolledClassRoom>> GetEnrolledCourseAsync(string hashedUserId, string classTitle, CancellationToken cancellationToken)
    {
        string cleanClassName = classTitle.ToNormalized();

        FindOptions options = new()
        {
            Collation = new Collation("en", strength: CollationStrength.Secondary)
        };

        ObjectId? userId = await _tokenService.GetActualUserIdAsync(hashedUserId, cancellationToken);

        if (userId is null)
        {
            return new(
                false,
                Error: new(
                    ErrorCode.IsInvalidUserReference,
                    "No id found for this user"
                )
            );
        }

        AppUser? appUser = await _collectionAppUser.Find<AppUser>(
            doc => doc.Id == userId
        ).FirstOrDefaultAsync(cancellationToken);

        if (appUser is null)
        {
            return new(
                false,
                Error: new(
                    ErrorCode.IsUserNotFound,
                    "User not found"
                )
            );
        }

        ClassRoom? targetClass = await _collectionClass.Find(doc => doc.ClassRoomName == cleanClassName, options).FirstOrDefaultAsync(cancellationToken);

        EnrolledClassRoom? enrolledClass = appUser.EnrolledClasses
            .FirstOrDefault(ec => ec.ClassRoomId == targetClass.Id);
        if (enrolledClass is null)
        {
            return new(
                false,
                Error: new(
                    ErrorCode.IsClassRoomNotFound,
                    "No class found for this user"
                )
            );
        }

        return new(
            true,
            enrolledClass,
            null
        );
    }
}
