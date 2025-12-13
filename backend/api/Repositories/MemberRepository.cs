using api.DTOs.Account;
using api.DTOs.Helpers;

namespace api.Repositories;

public class MemberRepository : IMemberRepository
{
    #region Constructor
    IMongoCollection<AppUser> _collectionAppUser;
    IMongoCollection<Attendance> _collectionAttendence;
    IMongoCollection<Class> _collectionClass;
    private readonly ITokenService _tokenService;
    private readonly UserManager<AppUser> _userManager;

    public MemberRepository(IMongoClient client, IMyMongoDbSettings dbSettings, ITokenService tokenService, UserManager<AppUser> userManager)
    {
        var database = client.GetDatabase(dbSettings.DatabaseName);
        _collectionAppUser = database.GetCollection<AppUser>(AppVariablesExtensions.CollectionUsers);
        _collectionAttendence = database.GetCollection<Attendance>(AppVariablesExtensions.CollectionAttendences);
        _collectionClass = database.GetCollection<Class>(AppVariablesExtensions.CollectionCourses);

        _tokenService = tokenService;
        _userManager = userManager;
    }
    #endregion Constructor

    public async Task<PagedList<Attendance>> GetAllAttendenceAsync(AttendenceParams attendenceParams, ObjectId? userId, string targetClassTitle, CancellationToken cancellationToken)
    {
        AppUser? appUser = await _collectionAppUser.Find<AppUser>(
            doc => doc.Id == userId).FirstOrDefaultAsync(cancellationToken);
        if (appUser is null)
        {
            var emptyQuery = _collectionAttendence.AsQueryable().Where(_ => false);
            return await PagedList<Attendance>.CreatePagedListAsync(
                emptyQuery, attendenceParams.PageNumber, attendenceParams.PageSize, cancellationToken);
        }

        ObjectId? targetClassId = await _collectionClass.AsQueryable()
            .Where(doc => doc.ClassName == targetClassTitle.ToUpper())
            .Select(doc => doc.Id)
            .FirstOrDefaultAsync(cancellationToken);

        if (targetClassId == default)
        {
            var emptyQuery = _collectionAttendence.AsQueryable().Where(_ => false);
            return await PagedList<Attendance>.CreatePagedListAsync(
                emptyQuery, attendenceParams.PageNumber, attendenceParams.PageSize, cancellationToken);
        }

        IQueryable<Attendance>? query = _collectionAttendence.AsQueryable<Attendance>()
            .Where(doc => doc.StudentId == appUser.Id && doc.ClassId == targetClassId);

        return await PagedList<Attendance>.CreatePagedListAsync(query, attendenceParams.PageNumber, attendenceParams.PageSize, cancellationToken);
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
            string trimmed = memberUpdateDto.Name.Trim();
            if (!string.Equals(targetAppUser.Name, trimmed, StringComparison.Ordinal))
            {
                updateDefinitions.Add(updateDefinitionBuilder.Set(appUser => appUser.Name, trimmed));
            }
        }

        if (!string.IsNullOrWhiteSpace(memberUpdateDto.LastName))
        {
            string trimmed = memberUpdateDto.LastName.Trim();
            if (!string.Equals(targetAppUser.LastName, trimmed, StringComparison.Ordinal))
            {
                updateDefinitions.Add(updateDefinitionBuilder.Set(appUser => appUser.LastName, trimmed));
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

    public async Task<ProfileDto?> GetProfileAsync(string hashedUserId, CancellationToken cancellationToken)
    {
        ObjectId? userId = await _tokenService.GetActualUserIdAsync(hashedUserId, cancellationToken);

        if (userId is null) return null;

        string? loggedInUserName = await _collectionAppUser.AsQueryable()
            .Where(doc => doc.Id == userId)
            .Select(doc => doc.NormalizedUserName)
            .FirstOrDefaultAsync(cancellationToken);

        if (loggedInUserName is null)
            return null;

        AppUser appUser = await _collectionAppUser.Find<AppUser>(appUser => appUser.NormalizedUserName == loggedInUserName).
            FirstOrDefaultAsync(cancellationToken);

        return appUser is null
            ? null
            : Mappers.ConvertAppUserToProfileDto(appUser);
    }

    public async Task<List<Class>> GetClassAsync(string hashedUserId, CancellationToken cancellationToken)
    {
        ObjectId? userId = await _tokenService.GetActualUserIdAsync(hashedUserId, cancellationToken);

        if (userId is null) return new List<Class>();

        string? loggedInUserName = await _collectionAppUser.AsQueryable()
            .Where(doc => doc.Id == userId)
            .Select(doc => doc.NormalizedUserName)
            .FirstOrDefaultAsync(cancellationToken);

        if (loggedInUserName is null)
            return new List<Class>();

        List<ObjectId>? enrolledCourseIds = await _collectionAppUser.AsQueryable<AppUser>()
            .Where(appUser => appUser.NormalizedUserName == loggedInUserName.ToUpper())
            .SelectMany(appUser => appUser.EnrolledClasses)
            .Select(doc => doc.ClassId)
            .ToListAsync(cancellationToken);

        if (enrolledCourseIds is null || enrolledCourseIds.Count == 0)
            return [];

        List<Class>? courses = await _collectionClass.Find<Class>(doc =>
            enrolledCourseIds.Contains(doc.Id)).ToListAsync(cancellationToken);

        return courses ?? new List<Class>();
    }

    public async Task<EnrolledClass?> GetEnrolledCourseAsync(string hashedUserId, string classTitle, CancellationToken cancellationToken)
    {
        ObjectId? userId = await _tokenService.GetActualUserIdAsync(hashedUserId, cancellationToken);

        if (userId is null) return null;

        AppUser? appUser = await _collectionAppUser.Find<AppUser>(
            doc => doc.Id == userId
        ).FirstOrDefaultAsync(cancellationToken);

        if (appUser is null)
            return null;

        Class? targetClass = await _collectionClass.Find(doc => doc.ClassName.ToUpper() == classTitle.ToUpper()).FirstOrDefaultAsync(cancellationToken);

        EnrolledClass? enrolledClass = appUser.EnrolledClasses
            .FirstOrDefault(ec => ec.ClassId == targetClass.Id);
        if (enrolledClass is null)
            return null;

        return enrolledClass;
    }
}
