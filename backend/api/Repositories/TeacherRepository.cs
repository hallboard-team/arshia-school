namespace api.Repositories;

public class TeacherRepository : ITeacherRepository
{
    #region Vars and Constructor
    private readonly IMongoCollection<AppUser> _collectionAppUser;
    private readonly IMongoCollection<Course> _collectionCourse;
    private readonly IMongoCollection<Class> _collectionClass;
    private readonly UserManager<AppUser> _userManager;
    private readonly ITokenService _tokenService;
    private readonly IMongoCollection<Attendance> _collectionAttendence;

    public TeacherRepository(IMongoClient client, ITokenService tokenService, IMyMongoDbSettings dbSettings, UserManager<AppUser> userManager)
    {
        var database = client.GetDatabase(dbSettings.DatabaseName);
        _collectionAppUser = database.GetCollection<AppUser>(AppVariablesExtensions.CollectionUsers);
        _collectionAttendence = database.GetCollection<Attendance>(AppVariablesExtensions.CollectionAttendences);
        _collectionCourse = database.GetCollection<Course>(AppVariablesExtensions.CollectionCourses);
        _collectionClass = database.GetCollection<Class>(AppVariablesExtensions.CollectionClasses);

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

    public async Task<List<Class>> GetClassAsync(string hashedUserId, CancellationToken cancellationToken)
    {
        ObjectId? userId = await _tokenService.GetActualUserIdAsync(hashedUserId, cancellationToken);

        if (userId is null)
            return [];

        List<Class>? classes = await _collectionClass.Find<Class>(doc =>
            doc.ProfessorsIds.Contains(userId.Value)).ToListAsync(cancellationToken);

        return classes ?? [];
    }

    public async Task<ShowStudentStatusDto?> AddAsync(AddStudentStatusDto teacherInput, string courseTitle, CancellationToken cancellationToken)
    {
        if (string.IsNullOrEmpty(teacherInput.UserName))
            return null;

        AppUser? targetAppUser = await _collectionAppUser
            .Find(s => s.NormalizedUserName == teacherInput.UserName.ToUpper())
            .FirstOrDefaultAsync(cancellationToken);

        if (targetAppUser is null)
            return null;

        DateOnly currentDate = DateOnly.FromDateTime(DateTime.UtcNow);

        ObjectId targetCourseId = await _collectionCourse.AsQueryable<Course>()
            .Where(doc => doc.Title == courseTitle.ToUpper())
            .Select(doc => doc.Id)
            .FirstOrDefaultAsync(cancellationToken);

        if (teacherInput.IsAbsent == false)
            return null;

        Attendance existingAttendence = await _collectionAttendence
            .Find(doc => doc.StudentId == targetAppUser.Id && doc.Date == currentDate && doc.ClassId == targetCourseId)
            .FirstOrDefaultAsync(cancellationToken);

        if (existingAttendence != null)
            return null;

        Attendance? attendence = Mappers.ConvertAddStudentStatusDtoToAttendence(teacherInput, targetAppUser.Id, targetCourseId, currentDate);

        if (_collectionAttendence is not null)
        {
            await _collectionAttendence.InsertOneAsync(attendence, null, cancellationToken);
        }

        if (ObjectId.Equals != null)
        {
            ShowStudentStatusDto showStudentStatusDto = Mappers.ConvertAttendenceToShowStudentStatusDto(attendence);

            return showStudentStatusDto;
        }

        return null;
    }

    public async Task<bool> DeleteAsync(ObjectId userId, string targetUserName, string targetCourseTitle, DateOnly currentDate, CancellationToken cancellationToken)
    {
        ObjectId? targetUserId = await _collectionAppUser.AsQueryable()
            .Where(doc => doc.NormalizedUserName == targetUserName.ToUpper())
            .Select(doc => doc.Id)
            .FirstOrDefaultAsync(cancellationToken);

        if (targetUserId is null)
            return false;

        ObjectId targetCourseId = await _collectionCourse.AsQueryable()
            .Where(doc => doc.Title == targetCourseTitle.ToUpper())
            .Select(doc => doc.Id)
            .FirstOrDefaultAsync(cancellationToken);

        DeleteResult deleteResult = await _collectionAttendence.DeleteOneAsync(
            doc => doc.StudentId == targetUserId && doc.Date == currentDate && doc.ClassId == targetCourseId,
            cancellationToken);

        return deleteResult.DeletedCount > 0;
    }

    public async Task<PagedList<AppUser>> GetAllAsync(PaginationParams paginationParams, string targetTitle, string hashedUserId, CancellationToken cancellationToken)
    {
        ObjectId? userId = await _tokenService.GetActualUserIdAsync(hashedUserId, cancellationToken);
        if (userId is null)
        {
            var empty = _collectionAppUser.AsQueryable().Where(_ => false);
            return await PagedList<AppUser>.CreatePagedListAsync(
                empty, paginationParams.PageNumber, paginationParams.PageSize, cancellationToken);
        }

        ObjectId? classId = await _collectionClass.AsQueryable()
            .Where(doc => doc.ClassName.ToUpper() == targetTitle.ToUpper())
            .Select(doc => doc.Id)
            .FirstOrDefaultAsync(cancellationToken);

        IQueryable<AppUser> query = _collectionAppUser.AsQueryable()
            .Where(user => user.EnrolledClasses.Any(course => course.ClassId == classId && user.Id != userId));

        return await PagedList<AppUser>.CreatePagedListAsync(query, paginationParams.PageNumber, paginationParams.PageSize, cancellationToken);
    }

    public async Task<Dictionary<ObjectId, bool>> CheckIsAbsentAsync(List<ObjectId> studentIds, ObjectId courseId, CancellationToken cancellationToken)
    {
        DateOnly currentDate = DateOnly.FromDateTime(DateTime.UtcNow);

        var attendances = await _collectionAttendence
            .Find(a => studentIds.Contains(a.StudentId) && a.ClassId == courseId && a.Date == currentDate)
            .ToListAsync(cancellationToken);

        return studentIds.ToDictionary(
            studentId => studentId,
            studentId => attendances.Any(a => a.StudentId == studentId)
        );
    }
}
