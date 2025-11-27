namespace api.Repositories;

public class CourseRepository : ICourseRepository
{
    #region Vars and Constructor
    private readonly IMongoCollection<Course> _collectionCourse;
    private readonly IMongoCollection<AppUser> _collectionAppUser;
    private readonly IMongoClient _client;

    public CourseRepository(IMongoClient client, ITokenService tokenService, IMyMongoDbSettings dbSettings)
    {
        _client = client;
        var database = client.GetDatabase(dbSettings.DatabaseName);
        _collectionCourse = database.GetCollection<Course>(AppVariablesExtensions.CollectionCourses);

        _collectionAppUser = database.GetCollection<AppUser>(AppVariablesExtensions.CollectionUsers);
    }
    #endregion Vars and Constructor

    public async Task<ShowCourseDto> AddCourseAsync(AddCourseDto managerInput, CancellationToken cancellationToken)
    {
        int totalMinutes = (int)Math.Round(managerInput.Hours * 60d);
        int classMinutes = (int)Math.Round(managerInput.HoursPerClass * 60d);

        if (classMinutes <= 0) throw new ArgumentOutOfRangeException(nameof(classMinutes));

        int calcDays = (int)Math.Ceiling((double)totalMinutes / classMinutes);

        Course? course = Mappers.ConvertAddCourseDtoToCourse(managerInput, calcDays);

        await _collectionCourse.InsertOneAsync(course, cancellationToken: cancellationToken);

        return Mappers.ConvertCourseToShowCourseDto(course);
    }

    public async Task<PagedList<Course>> GetAllAsync(PaginationParams paginationParams, CancellationToken cancellationToken)
    {
        IQueryable<Course> query = _collectionCourse.AsQueryable();
        return await PagedList<Course>.CreatePagedListAsync(query, paginationParams.PageNumber,
            paginationParams.PageSize, cancellationToken);
    }

    public async Task<List<string>> GetProfessorUserNamesByIdsAsync(List<ObjectId> professorIds, CancellationToken cancellationToken)
    {
        if (professorIds == null || professorIds.Count == 0)
            return new List<string>();

        List<string> usernames = await _collectionAppUser
            .Find(p => professorIds.Contains(p.Id))
            .Project(p => p.NormalizedUserName ?? string.Empty)
            .ToListAsync(cancellationToken);

        return usernames
            .Where(u => !string.IsNullOrWhiteSpace(u))
            .Select(u => u.Trim())
            .ToList();
    }

    public async Task<List<string>> GetProfessorNamesByIdsAsync(List<ObjectId> professorIds, CancellationToken cancellationToken)
    {
        List<AppUser> professors = await _collectionAppUser
            .Find(professor => professorIds.Contains(professor.Id))
            .ToListAsync(cancellationToken);

        return professors.Select(p => $"{p.Name} {p.LastName}").ToList();
    }

    public async Task<bool> UpdateCourseAsync(
        UpdateCourseDto updateCourseDto, string targetCourseTitle,
        CancellationToken cancellationToken)
    {
        int totalMinutes = (int)Math.Round(updateCourseDto.Hours * 60d);
        int classMinutes = (int)Math.Round(updateCourseDto.HoursPerClass * 60d);
        if (classMinutes <= 0) throw new ArgumentOutOfRangeException(nameof(updateCourseDto.HoursPerClass));

        int? calcDays = (int)Math.Ceiling((double)totalMinutes / classMinutes);

        UpdateDefinition<Course> updatedCourse = Builders<Course>.Update
            .Set(c => c.Title, updateCourseDto.Title?.ToUpper())
            .Set(c => c.Tuition, updateCourseDto.Tuition)
            .Set(c => c.TotalMinutes, totalMinutes)
            .Set(c => c.ClassMinutes, classMinutes)
            .Set(c => c.Days, calcDays)
            .Set(c => c.Start, updateCourseDto.Start)
            .Set(c => c.IsStarted, updateCourseDto.IsStarted);

        UpdateResult updateResult = await _collectionCourse.UpdateOneAsync(
            doc => doc.Title == targetCourseTitle.ToUpper(), updatedCourse, null, cancellationToken
        );

        return updateResult.ModifiedCount == 1;
    }

    public async Task<bool> AddProfessorToCourseAsync(string targetCourseTitle, string professorUserName, CancellationToken cancellationToken)
    {
        Course course = await _collectionCourse.Find(c =>
            c.Title == targetCourseTitle.ToUpper()).FirstOrDefaultAsync(cancellationToken);

        if (course is null)
            return false;

        ObjectId professorId = await _collectionAppUser.AsQueryable()
            .Where(doc => doc.NormalizedUserName == professorUserName.ToUpper())
            .Select(doc => doc.Id)
            .FirstOrDefaultAsync(cancellationToken);

        if (professorId.Equals(null))
            return false;

        UpdateDefinition<Course> updateCourse = Builders<Course>.Update
            .AddToSet(doc => doc.ProfessorsIds, professorId);

        var result = await _collectionCourse.UpdateOneAsync(
            doc => doc.Title == targetCourseTitle.ToUpper(), updateCourse
        );

        return result.ModifiedCount > 0;
    }

    public async Task<bool> RemoveProfessorFromCourseAsync(string targetCourseTitle, string professorName, CancellationToken cancellationToken)
    {
        Course course = await _collectionCourse.Find(c =>
            c.Title == targetCourseTitle.ToUpper()).FirstOrDefaultAsync(cancellationToken);

        if (course is null)
            return false;

        ObjectId professorId = await _collectionAppUser.AsQueryable()
            .Where(doc => doc.NormalizedUserName == professorName.ToUpper())
            .Select(doc => doc.Id)
            .FirstOrDefaultAsync(cancellationToken);

        if (professorId.Equals(null))
            return false;

        UpdateDefinition<Course> deleteProfessor = Builders<Course>.Update
            .Pull(doc => doc.ProfessorsIds, professorId);

        var result = await _collectionCourse.UpdateOneAsync(
            doc => doc.Title == targetCourseTitle.ToUpper(), deleteProfessor
        );

        return result.ModifiedCount > 0;
    }

    public async Task<ShowCourseDto?> GetCourseByTitleAsync(string courseTitle, CancellationToken cancellationToken)
    {
        Course? course = await _collectionCourse
            .Find(c => c.Title == courseTitle.ToUpper())
            .FirstOrDefaultAsync(cancellationToken);

        if (course is null) return null;

        List<string> professorUserNames = await _collectionAppUser
            .Find(doc => course.ProfessorsIds.Contains(doc.Id))
            .Project(doc => doc.NormalizedUserName ?? string.Empty)
            .ToListAsync(cancellationToken);

        List<string> safeUserNames = professorUserNames
            .Where(u => !string.IsNullOrWhiteSpace(u))
            .Select(u => u!)
            .ToList();

        return new ShowCourseDto
        {
            Title = course.Title,
            Tuition = course.Tuition,
            Hours = course.TotalMinutes / 60d,
            HoursPerClass = course.ClassMinutes / 60d,
            Start = course.Start,
            IsStarted = course.IsStarted,
            ProfessorUserNames = safeUserNames
        };
    }

    public async Task<List<ShowClassAndTitleDto>> GetClassesAndTitles(CancellationToken cancellationToken)
    {
        IEnumerable<Course> courses = await _collectionCourse.Find(new BsonDocument()).ToListAsync();

        List<ShowClassAndTitleDto> classesAndCourses = [];

        foreach (Course course in courses)
        {
            ShowClassAndTitleDto classAndCourse = new(
                Title: course.Title,
                ClassName: course.ClassName
            );

            classesAndCourses.Add(classAndCourse);
        }

        return classesAndCourses;
    }
}
