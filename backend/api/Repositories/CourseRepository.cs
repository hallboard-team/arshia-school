using api.DTOs.Account;
using api.DTOs.Helpers;

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

    public async Task<OperationResult<ShowCourseDto>> AddCourseAsync(CreateCourseDto managerInput, CancellationToken cancellationToken)
    {
        string cleanCourseName = managerInput.Title.ToNormalized();

        FindOptions options = new()
        {
            Collation = new Collation("en", strength: CollationStrength.Secondary)
        };

        bool isCourseExists = await _collectionCourse.Find(doc => doc.Title == cleanCourseName, options).AnyAsync(cancellationToken);

        if (isCourseExists)
        {
            return new(
                false,
                Error: new(
                    ErrorCode.IsDuplicateCourse,
                    "The course is already registered"
                )
            );
        }

        Course? course = Mappers.ConvertAddCourseDtoToCourse(managerInput);

        await _collectionCourse.InsertOneAsync(course, null, cancellationToken);

        return new(
            true,
            Mappers.ConvertCourseToShowCourseDto(course),
            null
        );
    }

    public async Task<OperationResult<PagedList<Course>>> GetAllAsync(PaginationParams paginationParams, CancellationToken cancellationToken)
    {
        IQueryable<Course> query = _collectionCourse.AsQueryable();

        PagedList<Course> pagedCourses = await PagedList<Course>.CreatePagedListAsync(query, paginationParams.PageNumber,
            paginationParams.PageSize, cancellationToken);

        return new(
            true,
            pagedCourses,
            null
        );
    }

    public async Task<OperationResult<ShowCourseDto>> UpdateCourseAsync(
        UpdateCourseDto updateCourseDto, string targetCourseTitle,
        CancellationToken cancellationToken)
    {
        string cleanCourseName = targetCourseTitle.ToNormalized();

        FindOptions options = new()
        {
            Collation = new Collation("en", strength: CollationStrength.Secondary)
        };

        Course? targetCourse = await _collectionCourse.Find(doc => doc.Title == cleanCourseName, options).FirstOrDefaultAsync(cancellationToken);

        if (targetCourse is null)
        {
            return new(
                false,
                Error: new(
                    ErrorCode.IsNotFound,
                    "Course not found"
                )
            );
        }

        UpdateDefinition<Course> updatedDef = Builders<Course>.Update
            .Set(c => c.Title, updateCourseDto.Title.ToNormalized())
            .Set(c => c.Description, updateCourseDto.Description)
            .Set(c => c.TotalMinutes, updateCourseDto.TotalMinutes)
            .Set(c => c.IsActive, updateCourseDto.IsActive);

        UpdateResult updateResult = await _collectionCourse.UpdateOneAsync(
            doc => doc.Id == targetCourse.Id, updatedDef, null, cancellationToken
        );

        if (updateResult.ModifiedCount == 1)
        {
            Course? updatedCourse = await _collectionCourse.Find(doc => doc.Id == targetCourse.Id).FirstOrDefaultAsync(cancellationToken);

            return new(
                true,
                Mappers.ConvertCourseToShowCourseDto(updatedCourse),
                null
            );
        }

        return new(
            false,
            Error: new(
                ErrorCode.IsOperationFailed,
                "Course update failed! Try again"
            )
        );
    }

    public async Task<OperationResult<ShowCourseDto>> GetCourseByTitleAsync(string courseTitle, CancellationToken cancellationToken)
    {
        string cleanCourseName = courseTitle.ToNormalized();

        FindOptions options = new()
        {
            Collation = new Collation("en", strength: CollationStrength.Secondary)
        };

        Course? course = await _collectionCourse
            .Find(c => c.Title == cleanCourseName, options)
            .FirstOrDefaultAsync(cancellationToken);

        if (course is null)
        {
            return new(
                false,
                Error: new(
                    ErrorCode.IsNotFound,
                    "Course not found"
                )
            );
        }

        return new(
            true,
            Mappers.ConvertCourseToShowCourseDto(course),
            null
        );
    }

    public async Task<OperationResult> DeleteCourseAsync(string courseName, CancellationToken cancellationToken)
    {
        string cleanCourseName = courseName.ToNormalized();

        FindOptions options = new()
        {
            Collation = new Collation("en", strength: CollationStrength.Secondary)
        };

        Course? course = await _collectionCourse.Find(doc => doc.Title == cleanCourseName, options).FirstOrDefaultAsync(cancellationToken);

        if (course is null)
        {
            return new(
                false,
                Error: new(
                    ErrorCode.IsNotFound,
                    "Course not found"
                )
            );
        }

        DeleteResult deleteResult = await _collectionCourse.DeleteOneAsync(doc => doc.Id == course.Id, cancellationToken);

        return deleteResult.DeletedCount == 1
        ? new(
            true,
            null
        )
        : new(
            false,
            new(
                ErrorCode.IsOperationFailed,
                "Course deletion failed! Try again"
            )
        );
    }

    public async Task<OperationResult<ShowCourseDto>> GetCourseByIdAsync(ObjectId courseId, CancellationToken cancellationToken)
    {
        Course? course = await _collectionCourse.Find(doc => doc.Id == courseId).FirstOrDefaultAsync(cancellationToken);

        if (course is null)
        {
            return new(
                false,
                Error: new(
                    ErrorCode.IsCourseNotFound,
                    "Course not found"
                )
            );
        }

        return new(
            true,
            Mappers.ConvertCourseToShowCourseDto(course),
            null
        );
    }

    // public async Task<List<ShowClassAndTitleDto>> GetClassesAndTitles(CancellationToken cancellationToken)
    // {
    //     IEnumerable<Class> courses = await _collectionCourse.Find(new BsonDocument()).ToListAsync();

    //     List<ShowClassAndTitleDto> classesAndCourses = [];

    //     foreach (Class course in courses)
    //     {
    //         ShowClassAndTitleDto classAndCourse = new(
    //             Title: course.Title,
    //             ClassName: course.ClassName
    //         );

    //         classesAndCourses.Add(classAndCourse);
    //     }

    //     return classesAndCourses;
    // }
}
