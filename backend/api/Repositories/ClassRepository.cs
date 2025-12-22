using System.Diagnostics.Contracts;
using api.DTOs.Account;
using api.DTOs.Helpers;
using ZstdSharp.Unsafe;

namespace api.Repositories;

public class ClassRepository : IClassRepository
{
    #region dependensy injection
    private readonly IMongoClient _client;
    private readonly IMongoCollection<Class> _collectionClass;
    private readonly IMongoCollection<Course> _collectionCourse;
    private readonly IMongoCollection<Site> _collectionSite;
    private readonly IMongoCollection<AppUser> _collectionAppUser;

    public ClassRepository(
        IMongoClient client,
        IMyMongoDbSettings dbSettings
    )
    {
        _client = client;
        IMongoDatabase database = client.GetDatabase(dbSettings.DatabaseName);

        _collectionClass = database.GetCollection<Class>(AppVariablesExtensions.CollectionClasses);
        _collectionCourse = database.GetCollection<Course>(AppVariablesExtensions.CollectionCourses);
        _collectionSite = database.GetCollection<Site>(AppVariablesExtensions.CollectionSites);
        _collectionAppUser = database.GetCollection<AppUser>(AppVariablesExtensions.CollectionUsers);
    }
    #endregion

    public async Task<OperationResult<ShowClassDto>> CreateClassAsync(CreateClassDto request, CancellationToken cancellationToken)
    {
        Class? targetClass = await _collectionClass.Find(doc => doc.ClassName.ToUpper() == request.ClassName.ToUpper()).FirstOrDefaultAsync(cancellationToken);

        if (targetClass is not null)
        {
            return new(
                false,
                Error: new(
                    ErrorCode.IsDuplicateClass,
                    "Class is already registered"
                )
            );
        }

        Course? course = await _collectionCourse.Find(doc => doc.Title.ToUpper() == request.CourseName.ToUpper()).FirstOrDefaultAsync(cancellationToken);

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

        Site? site = await _collectionSite.Find(doc => doc.Name.ToUpper() == request.SiteName.ToUpper()).FirstOrDefaultAsync(cancellationToken);

        if (site is null)
        {
            return new(
                false,
                Error: new(
                    ErrorCode.IsSiteNotFound,
                    "Site not found"
                )
            );
        }

        int totalMinutes = (int)Math.Round(course.TotalMinutes * 60d);
        int classMinutes = (int)Math.Round(request.ClassMinutes * 60d);

        int calcDays = (int)Math.Ceiling((double)totalMinutes / classMinutes);

        Class model = Mappers.ConvertCreateClassDtoToClass(request, course.Id, site.Id, calcDays);

        await _collectionClass.InsertOneAsync(model, null, cancellationToken);

        ShowCourseDto courseDto = Mappers.ConvertCourseToShowCourseDto(course);
        ShowSiteDto siteDto = Mappers.ConvertSiteToShowSiteDto(site);

        return new(
            true,
            Mappers.ConvertClassToShowClassDto(model, courseDto, siteDto, [], []),
            null
        );
    }

    public async Task<PagedList<Class>> GetAllClassesAsync(PaginationParams paginationParams, CancellationToken cancellationToken)
    {
        IQueryable<Class> query = _collectionClass.AsQueryable();

        return await PagedList<Class>.CreatePagedListAsync(query, paginationParams.PageNumber, paginationParams.PageSize, cancellationToken);
    }

    public async Task<OperationResult<ShowClassDto>> GetClassByNameAsync(string className, CancellationToken cancellationToken)
    {
        Class model = await _collectionClass.Find(doc => doc.ClassName.ToUpper() == className.ToUpper()).FirstOrDefaultAsync(cancellationToken);

        if (model is null)
        {
            return new(
                false,
                Error: new(
                    ErrorCode.IsNotFound,
                    "Class not found"
                )
            );
        }

        Course? course = await _collectionCourse.Find(doc => doc.Id == model.CourseId).FirstOrDefaultAsync(cancellationToken);
        Site? site = await _collectionSite.Find(doc => doc.Id == model.SiteId).FirstOrDefaultAsync(cancellationToken);

        List<string> userNames = await GetProfessorUserNamesByIdsAsync(model.ProfessorsIds, cancellationToken);
        List<string> names = await GetProfessorNamesByIdsAsync(model.ProfessorsIds, cancellationToken);

        ShowCourseDto courseDto = Mappers.ConvertCourseToShowCourseDto(course);
        ShowSiteDto siteDto = Mappers.ConvertSiteToShowSiteDto(site);

        return new(
            true,
            Mappers.ConvertClassToShowClassDto(model, courseDto, siteDto, userNames, names),
            null
        );
    }

    public async Task<List<string>> GetProfessorNamesByIdsAsync(List<ObjectId> professorIds, CancellationToken cancellationToken)
    {
        if (professorIds is null || professorIds.Count == 0)
            return [];

        List<string> userNames = await _collectionAppUser
            .Find(p => professorIds.Contains(p.Id))
            .Project(p => p.NormalizedUserName ?? string.Empty)
            .ToListAsync(cancellationToken);

        return [.. userNames
            .Where(u => !string.IsNullOrWhiteSpace(u))
            .Select(u => u.Trim())];
    }

    public async Task<List<string>> GetProfessorUserNamesByIdsAsync(List<ObjectId> professorIds, CancellationToken cancellationToken)
    {
        if (professorIds is null || professorIds.Count == 0)
            return [];

        List<string> names = await _collectionAppUser
            .Find(p => professorIds.Contains(p.Id))
            .Project(p => p.Name ?? string.Empty)
            .ToListAsync(cancellationToken);

        return [.. names.Where(u => !string.IsNullOrWhiteSpace(u)).Select(u => u.Trim())];
    }

    public async Task<OperationResult<ShowClassDto?>> UpdateClassAsync(string className, UpdateClassDto request, CancellationToken cancellationToken)
    {
        Class? targetClass = await _collectionClass.Find(doc => doc.ClassName.ToUpper() == className.ToUpper()).FirstOrDefaultAsync(cancellationToken);

        if (targetClass is null)
        {
            return new(
                false,
                Error: new(
                    ErrorCode.IsNotFound,
                    "Class not found"
                )
            );
        }

        Course? course = await _collectionCourse.Find(doc => doc.Id == targetClass.CourseId).FirstOrDefaultAsync(cancellationToken);
        Site? site = await _collectionSite.Find(doc => doc.Id == targetClass.SiteId).FirstOrDefaultAsync(cancellationToken);

        int totalMinutes = (int)Math.Round(course.TotalMinutes * 60d);
        int classMinutes = (int)Math.Round(request.ClassMinutes * 60d);

        int calcDays = (int)Math.Ceiling((double)totalMinutes / classMinutes);

        UpdateDefinition<Class> updateDef = Builders<Class>.Update
            .Set(doc => doc.ClassName, request.ClassName.ToLower().Trim())
            .Set(doc => doc.Tuition, request.Tuition)
            .Set(doc => doc.ClassMinutes, request.ClassMinutes)
            .Set(doc => doc.Days, calcDays)
            .Set(doc => doc.StartDate, request.StartDate)
            .Set(doc => doc.EndedDate, request.EndedDate)
            .Set(doc => doc.IsStarted, request.IsStarted)
            .Set(doc => doc.IsEnded, request.IsEnded)
            .Set(doc => doc.IsActive, request.IsActive);

        UpdateResult updateResult = await _collectionClass.UpdateOneAsync(doc => doc.Id == targetClass.Id, updateDef, null, cancellationToken);

        if (updateResult.ModifiedCount == 1)
        {
            Class? model = await _collectionClass.Find(doc => doc.Id == targetClass.Id).FirstOrDefaultAsync(cancellationToken);

            List<string> userNames = await GetProfessorUserNamesByIdsAsync(model.ProfessorsIds, cancellationToken);
            List<string> names = await GetProfessorNamesByIdsAsync(model.ProfessorsIds, cancellationToken);

            ShowCourseDto courseDto = Mappers.ConvertCourseToShowCourseDto(course);
            ShowSiteDto siteDto = Mappers.ConvertSiteToShowSiteDto(site);

            return new(
                true,
                Mappers.ConvertClassToShowClassDto(model, courseDto, siteDto, userNames, names),
                null
            );
        }

        return new(
            false,
            null,
            new(
                ErrorCode.IsOperationFailed,
                "Class update failed! Try again"
            )
        );
    }

    public async Task<OperationResult> AddProfessorToClassAsync(string targetClassTitle, string professorUserName, CancellationToken cancellationToken)
    {
        Class targetClass = await _collectionClass.Find(doc => doc.ClassName.ToUpper() == targetClassTitle.ToUpper()).FirstOrDefaultAsync(cancellationToken);

        if (targetClass is null)
        {
            return new(
                false,
                Error: new(
                    ErrorCode.IsNotFound,
                    "Class not found"
                )
            );
        }

        ObjectId? professorId = await _collectionAppUser.AsQueryable()
            .Where(doc => doc.NormalizedUserName == professorUserName.ToUpper())
            .Select(doc => doc.Id)
            .FirstOrDefaultAsync(cancellationToken);

        if (professorId.Equals(null))
        {
            return new(
                false,
                Error: new(
                    ErrorCode.IsUserNotFound,
                    "Target professor not found"
                )
            );
        }

        UpdateDefinition<Class> updateCourse = Builders<Class>.Update
            .AddToSet(doc => doc.ProfessorsIds, professorId.Value);

        UpdateResult updateResult = await _collectionClass.UpdateOneAsync(doc => doc.Id == targetClass.Id, updateCourse, null, cancellationToken);

        return updateResult.ModifiedCount == 1
                ? new(
                    true,
                    null
                )
                : new(
                    false,
                    new(
                        ErrorCode.IsOperationFailed,
                        "Add professor failed (or professor already exists in this class)"
                    )
                );
    }

    public async Task<OperationResult> RemoveProfessorFromClassAsync(string targetClassTitle, string professorUserName, CancellationToken cancellationToken)
    {
        Class targetClass = await _collectionClass.Find(doc => doc.ClassName.ToUpper() == targetClassTitle.ToUpper()).FirstOrDefaultAsync(cancellationToken);

        if (targetClass is null)
        {
            return new(
                false,
                Error: new(
                    ErrorCode.IsNotFound,
                    "Class not found"
                )
            );
        }

        ObjectId? professorId = await _collectionAppUser.AsQueryable()
            .Where(doc => doc.NormalizedUserName == professorUserName.ToUpper())
            .Select(doc => doc.Id)
            .FirstOrDefaultAsync(cancellationToken);

        if (professorId is null)
        {
            return new(
                false,
                Error: new(
                    ErrorCode.IsUserNotFound,
                    "Target professor not found"
                )
            );
        }

        if (!targetClass.ProfessorsIds.Contains(professorId.Value))
        {
            return new(
                false,
                Error: new(
                    ErrorCode.IsNotFound,
                    "This professor is not assigned to this class."
                )
            );
        }

        UpdateDefinition<Class> updateDef = Builders<Class>.Update
        .Pull(doc => doc.ProfessorsIds, professorId.Value);

        UpdateResult updateResult = await _collectionClass.UpdateOneAsync(doc => doc.Id == targetClass.Id, updateDef, null, cancellationToken);

        return updateResult.ModifiedCount == 1
        ? new(true, null)
        : new(
            false,
            new(
                ErrorCode.IsOperationFailed,
                "Database error: Could not remove professor."
            )
        );
    }

    public async Task<ObjectId?> GetClassIdByName(string className, CancellationToken cancellationToken)
    {
        ObjectId? classId = await _collectionClass.AsQueryable()
            .Where(doc => doc.ClassName.ToUpper() == className.ToUpper())
            .Select(doc => doc.Id)
            .FirstOrDefaultAsync(cancellationToken);

        if (classId is null)
            return null;

        return classId;
    }
}