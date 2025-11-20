using api.DTOs.Account;
using api.DTOs.Helpers;

namespace api.Repositories;

public class MemberRepository : IMemberRepository
{
    #region Constructor
    IMongoCollection<AppUser> _collectionAppUser;
    IMongoCollection<Attendence> _collectionAttendence;
    IMongoCollection<Course> _collectionCourse;
    private readonly ITokenService _tokenService;
    private readonly UserManager<AppUser> _userManager;

    public MemberRepository(IMongoClient client, IMyMongoDbSettings dbSettings, ITokenService tokenService, UserManager<AppUser> userManager)
    {
        var database = client.GetDatabase(dbSettings.DatabaseName);
        _collectionAppUser = database.GetCollection<AppUser>(AppVariablesExtensions.CollectionUsers);
        _collectionAttendence = database.GetCollection<Attendence>(AppVariablesExtensions.CollectionAttendences);
        _collectionCourse = database.GetCollection<Course>(AppVariablesExtensions.CollectionCourses);

        _tokenService = tokenService;
        _userManager = userManager;
    }
    #endregion Constructor

    public async Task<PagedList<Attendence>> GetAllAttendenceAsync(AttendenceParams attendenceParams, ObjectId? userId, string targetCourseTitle, CancellationToken cancellationToken)
    {
        AppUser? appUser = await _collectionAppUser.Find<AppUser>(
            doc => doc.Id == userId).FirstOrDefaultAsync(cancellationToken);
        if (appUser is null)
        {
            var emptyQuery = _collectionAttendence.AsQueryable().Where(_ => false);
            return await PagedList<Attendence>.CreatePagedListAsync(
                emptyQuery, attendenceParams.PageNumber, attendenceParams.PageSize, cancellationToken);
        }

        ObjectId targetCourseId = await _collectionCourse.AsQueryable()
            .Where(doc => doc.Title == targetCourseTitle.ToUpper())
            .Select(doc => doc.Id)
            .FirstOrDefaultAsync(cancellationToken);

        if (targetCourseId == default)
        {
            var emptyQuery = _collectionAttendence.AsQueryable().Where(_ => false);
            return await PagedList<Attendence>.CreatePagedListAsync(
                emptyQuery, attendenceParams.PageNumber, attendenceParams.PageSize, cancellationToken);
        }

        IQueryable<Attendence>? query = _collectionAttendence.AsQueryable<Attendence>()
            .Where(doc => doc.StudentId == appUser.Id && doc.CourseId == targetCourseId);

        return await PagedList<Attendence>.CreatePagedListAsync(query, attendenceParams.PageNumber, attendenceParams.PageSize, cancellationToken);
    }

    public async Task<OperationResult<TargetMemberDto>> UpdateMemberAsync(MemberUpdateDto memberUpdateDto, ObjectId userId, CancellationToken cancellationToken)
    {
        AppUser? targetAppUser = await _userManager.FindByIdAsync(userId.ToString());
        if (targetAppUser == null)
        {
            return new(
                false,
                Error: new(
                    ErrorCode.IsUserNotFound,
                    "User not found"
                )
            );
        }

        UpdateDefinition<AppUser> updatedUser = Builders<AppUser>.Update
            .Set(doc => doc.Name, memberUpdateDto.Name)
            .Set(doc => doc.LastName, memberUpdateDto.LastName)
            .Set(doc => doc.PhoneNum, memberUpdateDto.PhoneNum)
            .Set(doc => doc.DateOfBirth, memberUpdateDto.DateOfBirth);

        await _collectionAppUser.UpdateOneAsync(doc => doc.Id == userId, updatedUser, null, cancellationToken);

        AppUser? appUser = await _userManager.FindByIdAsync(userId.ToString());

        return new(
            true,
            Mappers.ConvertAppUserToTargetMemberDto(appUser!),
            null
        );
    }

    public async Task<ProfileDto?> GetProfileAsync(string HashedUserId, CancellationToken cancellationToken)
    {
        ObjectId? userId = await _tokenService.GetActualUserIdAsync(HashedUserId, cancellationToken);

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

    public async Task<List<Course>> GetCourseAsync(string hashedUserId, CancellationToken cancellationToken)
    {
        ObjectId? userId = await _tokenService.GetActualUserIdAsync(hashedUserId, cancellationToken);

        if (userId is null) return new List<Course>();

        string? loggedInUserName = await _collectionAppUser.AsQueryable()
            .Where(doc => doc.Id == userId)
            .Select(doc => doc.NormalizedUserName)
            .FirstOrDefaultAsync(cancellationToken);

        if (loggedInUserName is null)
            return new List<Course>();

        List<string>? enrolledCourseIds = await _collectionAppUser.AsQueryable<AppUser>()
            .Where(appUser => appUser.NormalizedUserName == loggedInUserName.ToUpper())
            .SelectMany(appUser => appUser.EnrolledCourses)
            .Select(doc => doc.CourseId.ToString())
            .ToListAsync(cancellationToken);

        if (enrolledCourseIds is null || enrolledCourseIds.Count == 0)
            return new List<Course>();

        List<Course>? courses = await _collectionCourse.Find<Course>(doc =>
            enrolledCourseIds.Contains(doc.Id.ToString())).ToListAsync(cancellationToken);

        return courses ?? new List<Course>();
    }

    public async Task<EnrolledCourse?> GetEnrolledCourseAsync(string HashedUserId, string courseTitle, CancellationToken cancellationToken)
    {
        ObjectId? userId = await _tokenService.GetActualUserIdAsync(HashedUserId, cancellationToken);

        if (userId is null) return null;

        AppUser? appUser = await _collectionAppUser.Find<AppUser>(
            doc => doc.Id == userId
        ).FirstOrDefaultAsync(cancellationToken);

        if (appUser is null)
            return null;

        EnrolledCourse? enrolledCourse = appUser.EnrolledCourses
            .FirstOrDefault(ec => ec.CourseTitle == courseTitle.ToUpper());
        if (enrolledCourse is null)
            return null;

        return enrolledCourse;
    }
}
