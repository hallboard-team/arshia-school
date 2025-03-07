
using api.Helpers;

namespace api.Repositories;

public class CourseRepository : ICourseRepository
{
    #region Vars and Constructor
    private readonly IMongoCollection<Course>? _collectionCourse;
    private readonly IMongoCollection<AppUser>? _collectionAppUser;
    // private readonly ITokenService _tokenService;
    private readonly IMongoClient _client;

    public CourseRepository(IMongoClient client, ITokenService tokenService, IMyMongoDbSettings dbSettings)
    {
        _client = client; 
        var database = client.GetDatabase(dbSettings.DatabaseName);
        _collectionCourse = database.GetCollection<Course>(AppVariablesExtensions.collectionCourses);

        _collectionAppUser = database.GetCollection<AppUser>(AppVariablesExtensions.collectionUsers);

        // _tokenService = tokenService;
    }
    #endregion Vars and Constructor

    public async Task<ShowCourseDto> AddCourseAsync(AddCourseDto managerInput, CancellationToken cancellationToken)
    {
        // int daysCalc = managerInput.Hours / managerInput.HoursPerClass;
        int calcDays = (int)Math.Ceiling(managerInput.Hours / managerInput.HoursPerClass);
        // if (daysCalc == 0) return null;

        Course? course = Mappers.ConvertAddCourseDtoToCourse(managerInput, calcDays);

        if (_collectionCourse is not null)
        {
            await _collectionCourse.InsertOneAsync(course, null, cancellationToken);
        }

        if (ObjectId.Equals != null)
        {
            ShowCourseDto showCourseDto = Mappers.ConvertCourseToShowCourseDto(course);

            return showCourseDto;
        }

        return null;
    }

    // public async Task<PagedList<Course>> GetAllAsync(PaginationParams paginationParams, CancellationToken cancellationToken)
    // {
    //     IMongoQueryable<Course> query = _collectionCourse.AsQueryable();

    //     return await PagedList<Course>.CreatePagedListAsync(query, paginationParams.PageNumber,
    //         paginationParams.PageSize, cancellationToken);
    // }

    public async Task<PagedList<Course>> GetAllAsync(PaginationParams paginationParams, CancellationToken cancellationToken)
    {
        IMongoQueryable<Course> query = _collectionCourse.AsQueryable();
        return await PagedList<Course>.CreatePagedListAsync(query, paginationParams.PageNumber,
            paginationParams.PageSize, cancellationToken);
    }

    public async Task<List<string>> GetProfessorNamesByIdsAsync(List<ObjectId> professorIds, CancellationToken cancellationToken)
    {
        List<AppUser> professorNames = await _collectionAppUser
            .Find(professor => professorIds.Contains(professor.Id))
            .ToListAsync(cancellationToken);

        return professorNames.Select(p => p.Name).ToList();
    }
     
    public async Task<bool> UpdateCourseAsync(
        UpdateCourseDto updateCourseDto, string targetCourseTitle, 
        CancellationToken cancellationToken)
    {
        int? calcDays = (int)Math.Ceiling(updateCourseDto.Hours / updateCourseDto.HoursPerClass);

        // AppUser targetProfessor = await _collectionAppUser.Find(
        //     doc => doc.Id.ToString() == updateCourseDto.ProfessorId
        // ).FirstOrDefaultAsync(cancellationToken);

        // if (targetProfessor is null)
        //     return false;

        UpdateDefinition<Course> updatedCourse = Builders<Course>.Update
            // .AddToSet(c => c.ProfessorsIds, targetProfessor.Id)
            // .Push(c => c.ProfessorsNames, targetProfessor.Name)
            .Set(c => c.Title, updateCourseDto.Title?.ToUpper())
            .Set(c => c.Tuition, updateCourseDto.Tuition)
            .Set(c => c.Hours, updateCourseDto.Hours)
            .Set(c => c.HoursPerClass, updateCourseDto.HoursPerClass)
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
            // .Push(doc => doc.ProfessorsNames, professorAppUser.Name);

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
            // .Pull(doc => doc.ProfessorsNames, professorAppUser.Name);

        var result = await _collectionCourse.UpdateOneAsync(
            doc => doc.Title == targetCourseTitle.ToUpper(), deleteProfessor
        );

        return result.ModifiedCount > 0;
    }

    public async Task<ShowCourseDto?> GetCourseByTitleAsync(string courseTitle, CancellationToken cancellationToken)
    {
        var course = await _collectionCourse
            .Find(c => c.Title == courseTitle.ToUpper())
            .FirstOrDefaultAsync(cancellationToken);

        // if (course == null)
        //     return null;

        var professorIds = course.ProfessorsIds;
        var professorNames = await _collectionAppUser
            .Find(doc => professorIds.Contains(doc.Id))
            .Project(doc => doc.Name) // فقط نام‌ها را نگه می‌داریم
            .ToListAsync(cancellationToken);
        
        // return course is not null ? Mappers.ConvertCourseToShowCourseDto(course, professorNames) : null;

        return new ShowCourseDto
        {
            Title = course.Title,
            Tuition = course.Tuition,
            Hours = course.Hours,
            HoursPerClass = course.HoursPerClass,
            Start = course.Start,
            IsStarted = course.IsStarted,
            ProfessorNames = professorNames
        };
    }
}