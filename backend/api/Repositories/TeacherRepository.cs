using api.DTOs.Account;
using api.DTOs.Helpers;

namespace api.Repositories;

public class TeacherRepository : ITeacherRepository
{
    #region Vars and Constructor
    private readonly IMongoCollection<AppUser> _collectionAppUser;
    private readonly IMongoCollection<Course> _collectionCourse;
    private readonly IMongoCollection<ClassRoom> _collectionClass;
    private readonly UserManager<AppUser> _userManager;
    private readonly ITokenService _tokenService;
    private readonly IMongoCollection<Attendance> _collectionAttendance;

    public TeacherRepository(IMongoClient client, ITokenService tokenService, IMyMongoDbSettings dbSettings, UserManager<AppUser> userManager)
    {
        var database = client.GetDatabase(dbSettings.DatabaseName);
        _collectionAppUser = database.GetCollection<AppUser>(AppVariablesExtensions.CollectionUsers);
        _collectionAttendance = database.GetCollection<Attendance>(AppVariablesExtensions.CollectionAttendences);
        _collectionCourse = database.GetCollection<Course>(AppVariablesExtensions.CollectionCourses);
        _collectionClass = database.GetCollection<ClassRoom>(AppVariablesExtensions.CollectionClasses);

        _userManager = userManager;
        _tokenService = tokenService;
    }
    #endregion Vars and Constructor

    public async Task<ObjectId?> GetObjectIdByUserNameAsync(string studentUserName, CancellationToken cancellationToken)
    {
        ObjectId? studentId = await _collectionAppUser.AsQueryable<AppUser>()
            .Where(appUser => appUser.NormalizedUserName == studentUserName.ToUpper())
            .Select(item => item.Id)
            .SingleOrDefaultAsync(cancellationToken);

        return ValidationsExtensions.ValidateObjectId(studentId);
    }

    public async Task<OperationResult<List<ClassRoom>>> GetClassesAsync(string hashedUserId, CancellationToken cancellationToken)
    {
        ObjectId? userId = await _tokenService.GetActualUserIdAsync(hashedUserId, cancellationToken);

        if (userId is null)
            return new(
                false,
                Error: new(
                    ErrorCode.IsInvalidUserReference,
                    "No id founded for this user"
                )
            );

        List<ClassRoom>? classes = await _collectionClass.Find<ClassRoom>(doc =>
            doc.ProfessorsIds.Contains(userId.Value)).ToListAsync(cancellationToken);

        return new(
            true,
            classes,
            null
        );
    }

    public async Task<OperationResult<ShowStudentStatusDto>> AddAsync(AddStudentStatusDto teacherInput, string courseTitle, CancellationToken cancellationToken)
    {
        AppUser? targetAppUser = await _collectionAppUser
            .Find(s => s.NormalizedUserName == teacherInput.UserName.ToUpper())
            .FirstOrDefaultAsync(cancellationToken);

        if (targetAppUser is null)
        {
            return new(
                false,
                Error: new(
                    ErrorCode.IsUserNotFound,
                    "User not found"
                )
            );
        }

        DateOnly currentDate = DateOnly.FromDateTime(DateTime.UtcNow);

        ObjectId targetCourseId = await _collectionCourse.AsQueryable<Course>()
            .Where(doc => doc.Title == courseTitle.ToUpper())
            .Select(doc => doc.Id)
            .FirstOrDefaultAsync(cancellationToken);

        Attendance existingAttendance = await _collectionAttendance
            .Find(doc => doc.StudentId == targetAppUser.Id && doc.Date == currentDate && doc.ClassId == targetCourseId)
            .FirstOrDefaultAsync(cancellationToken);

        if (existingAttendance != null)
        {
            return new(
                false,
                Error: new(
                    ErrorCode.IsAlreadyEnrolled,
                    "User is already a attendace"
                )
            );
        }

        Attendance? attendance = Mappers.ConvertAddStudentStatusDtoToAttendance(teacherInput, targetAppUser.Id, targetCourseId, currentDate);

        await _collectionAttendance.InsertOneAsync(attendance, null, cancellationToken);

        return new(
            true,
            Mappers.ConvertAttendanceToShowStudentStatusDto(attendance),
            null
        );
    }

    public async Task<OperationResult> DeleteAsync(ObjectId userId, string targetUserName, string targetCourseTitle, DateOnly currentDate, CancellationToken cancellationToken)
    {
        ObjectId? targetUserId = await _collectionAppUser.AsQueryable()
            .Where(doc => doc.NormalizedUserName == targetUserName.ToUpper())
            .Select(doc => doc.Id)
            .FirstOrDefaultAsync(cancellationToken);

        if (targetUserId is null)
        {
            return new(
                false,
                Error: new(
                    ErrorCode.IsUserNotFound,
                    "User not found"
                )
            );
        }

        ObjectId targetCourseId = await _collectionCourse.AsQueryable()
            .Where(doc => doc.Title == targetCourseTitle.ToUpper())
            .Select(doc => doc.Id)
            .FirstOrDefaultAsync(cancellationToken);

        DeleteResult deleteResult = await _collectionAttendance.DeleteOneAsync(
            doc => doc.StudentId == targetUserId && doc.Date == currentDate && doc.ClassId == targetCourseId,
            cancellationToken);

        if (deleteResult.DeletedCount > 0)
        {
            return new(
                true,
                null
            );
        }

        return new(
            false,
            Error: new(
                ErrorCode.IsAnyDeleteMake,
                "No deletion has made"
            )
        );
    }

    public async Task<OperationResult<PagedList<AppUser>>> GetAllAsync(PaginationParams paginationParams, string targetTitle, string hashedUserId, CancellationToken cancellationToken)
    {
        ObjectId? userId = await _tokenService.GetActualUserIdAsync(hashedUserId, cancellationToken);
        if (userId is null)
        {
            return new(
                false,
                Error: new(
                    ErrorCode.IsInvalidUserReference,
                    "No id founded for this user"
                )
            );
        }

        ObjectId? classId = await _collectionClass.AsQueryable()
            .Where(doc => doc.ClassRoomName.ToUpper() == targetTitle.ToUpper())
            .Select(doc => doc.Id)
            .FirstOrDefaultAsync(cancellationToken);

        IQueryable<AppUser> query = _collectionAppUser.AsQueryable()
            .Where(user => user.EnrolledClasses.Any(course => course.ClassRoomId == classId && user.Id != userId));

        PagedList<AppUser> pagedAppUsers = await PagedList<AppUser>.CreatePagedListAsync(query, paginationParams.PageNumber, paginationParams.PageSize, cancellationToken);

        return new(
            true,
            pagedAppUsers,
            null
        );
    }

    public async Task<OperationResult<Dictionary<ObjectId, bool>>> CheckIsAbsentAsync(List<ObjectId> studentIds, ObjectId courseId, CancellationToken cancellationToken)
    {
        DateOnly currentDate = DateOnly.FromDateTime(DateTime.UtcNow);

        var attendances = await _collectionAttendance
            .Find(a => studentIds.Contains(a.StudentId) && a.ClassId == courseId && a.Date == currentDate)
            .ToListAsync(cancellationToken);

        return new(
            true,
        studentIds.ToDictionary(
            studentId => studentId,
            studentId => attendances.Any(a => a.StudentId == studentId)
        ),
        null
        );
    }
}
