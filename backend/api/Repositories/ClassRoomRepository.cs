using System.Diagnostics.Contracts;
using api.DTOs.Account;
using api.DTOs.Helpers;
using ZstdSharp.Unsafe;

namespace api.Repositories;

public class ClassRoomRepository : IClassRoomRepository
{
    #region dependency injection
    private readonly IMongoClient _client;
    private readonly IMongoCollection<ClassRoom> _collectionClassRoom;
    private readonly IMongoCollection<Course> _collectionCourse;
    private readonly IMongoCollection<Site> _collectionSite;
    private readonly IMongoCollection<AppUser> _collectionAppUser;

    public ClassRoomRepository(
        IMongoClient client,
        IMyMongoDbSettings dbSettings
    )
    {
        _client = client;
        IMongoDatabase database = client.GetDatabase(dbSettings.DatabaseName);

        _collectionClassRoom = database.GetCollection<ClassRoom>(AppVariablesExtensions.CollectionClasses);
        _collectionCourse = database.GetCollection<Course>(AppVariablesExtensions.CollectionCourses);
        _collectionSite = database.GetCollection<Site>(AppVariablesExtensions.CollectionSites);
        _collectionAppUser = database.GetCollection<AppUser>(AppVariablesExtensions.CollectionUsers);
    }
    #endregion

    public async Task<OperationResult<ShowClassRoomDto>> CreateClassRoomAsync(CreateClassRoomDto request, CancellationToken cancellationToken)
    {
        string cleanClassRoomName = request.ClassRoomName.ToNormalized();
        string cleanCourseName = request.CourseName.ToNormalized();
        string cleanSiteName = request.SiteName.ToNormalized();

        FindOptions options = new()
        {
            Collation = new Collation("en", strength: CollationStrength.Secondary)
        };

        bool isClassRoomExist = await _collectionClassRoom.Find(doc => doc.ClassRoomName == cleanClassRoomName, options).AnyAsync(cancellationToken);

        if (isClassRoomExist)
        {
            return new(
                false,
                Error: new(
                    ErrorCode.IsDuplicateClass,
                    "Class is already registered"
                )
            );
        }

        Course? course = await _collectionCourse
        .Find(doc => doc.Title == cleanCourseName, options).FirstOrDefaultAsync(cancellationToken);

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

        Site? site = await _collectionSite
            .Find(doc => doc.Name == cleanSiteName, options).FirstOrDefaultAsync(cancellationToken);

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
        int classMinutes = (int)Math.Round(request.ClassRoomMinutes * 60d);

        int calcDays = (int)Math.Ceiling((double)totalMinutes / classMinutes);

        ClassRoom model = Mappers.ConvertCreateClassRoomDtoToClassRoom(request, course.Id, site.Id, calcDays);

        await _collectionClassRoom.InsertOneAsync(model, null, cancellationToken);

        ShowCourseDto courseDto = Mappers.ConvertCourseToShowCourseDto(course);
        ShowSiteDto siteDto = Mappers.ConvertSiteToShowSiteDto(site);

        return new(
            true,
            Mappers.ConvertClassRoomToShowClassRoomDto(model, courseDto, siteDto, [], []),
            null
        );
    }

    public async Task<OperationResult<PagedList<ClassRoom>>> GetAllClassRoomsAsync(PaginationParams paginationParams, CancellationToken cancellationToken)
    {
        IQueryable<ClassRoom> query = _collectionClassRoom.AsQueryable();

        PagedList<ClassRoom> pagedClassRooms = await PagedList<ClassRoom>.CreatePagedListAsync(query, paginationParams.PageNumber, paginationParams.PageSize, cancellationToken);

        return new(
            true,
            pagedClassRooms,
            null
        );
    }

    public async Task<OperationResult<ShowClassRoomDto>> GetClassRoomByNameAsync(string classRoomName, CancellationToken cancellationToken)
    {
        string cleanClassRoomName = classRoomName.ToNormalized();

        FindOptions options = new()
        {
            Collation = new Collation("en", strength: CollationStrength.Secondary)
        };

        ClassRoom model = await _collectionClassRoom.Find(doc => doc.ClassRoomName == classRoomName, options).FirstOrDefaultAsync(cancellationToken);

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

        OperationResult<IEnumerable<string>> userNamesOpResut = await GetProfessorUserNamesByIdsAsync(model.ProfessorsIds, cancellationToken);
        OperationResult<IEnumerable<string>> namesOpResult = await GetProfessorNamesByIdsAsync(model.ProfessorsIds, cancellationToken);

        ShowCourseDto courseDto = Mappers.ConvertCourseToShowCourseDto(course);
        ShowSiteDto siteDto = Mappers.ConvertSiteToShowSiteDto(site);

        return new(
            true,
            Mappers.ConvertClassRoomToShowClassRoomDto(model, courseDto, siteDto, userNamesOpResut.Result, namesOpResult.Result),
            null
        );
    }

    public async Task<OperationResult<IEnumerable<string>>> GetProfessorNamesByIdsAsync(List<ObjectId> professorIds, CancellationToken cancellationToken)
    {
        if (professorIds is null || professorIds.Count == 0)
            return new(
                false,
                [],
                null
            );

        List<string> names = await _collectionAppUser
            .Find(p => professorIds.Contains(p.Id) && p.Name != null && p.Name != "")
            .Project(p => p.Name.Trim())
            .ToListAsync(cancellationToken);

        return new(
            true,
            names,
            null
        );
    }

    public async Task<OperationResult<IEnumerable<string>>> GetProfessorUserNamesByIdsAsync(List<ObjectId> professorIds, CancellationToken cancellationToken)
    {
        if (professorIds is null || professorIds.Count == 0)
        {
            return new(
                false,
                [],
                null
            );
        }

        List<string> userNames = await _collectionAppUser
         .Find(p => professorIds.Contains(p.Id) && p.Name != null && p.Name != "")
         .Project(p => p.UserName!.Trim())
         .ToListAsync(cancellationToken);

        return new(
            true,
            userNames,
            null
        );
    }

    public async Task<OperationResult<ShowClassRoomDto>> UpdateClassRoomAsync(string classRoomName, UpdateClassRoomDto request, CancellationToken cancellationToken)
    {
        string cleanClassRoomName = classRoomName.ToNormalized();
        string cleanReqClassRoomName = request.ClassRoomName.ToNormalized();

        FindOptions options = new()
        {
            Collation = new Collation("en", strength: CollationStrength.Secondary)
        };

        ClassRoom? targetClassRoom = await _collectionClassRoom.Find(doc => doc.ClassRoomName == cleanClassRoomName, options).FirstOrDefaultAsync(cancellationToken);
        bool isDuplicateClassRoom = await _collectionClassRoom.Find(doc => doc.ClassRoomName == cleanReqClassRoomName, options).AnyAsync(cancellationToken);

        if (isDuplicateClassRoom)
        {
            return new(
                false,
                Error: new(
                    ErrorCode.IsDuplicateClass,
                    "Your new classroom is already exists! Select new one."
                )
            );
        }

        if (targetClassRoom is null)
        {
            return new(
                false,
                Error: new(
                    ErrorCode.IsNotFound,
                    "Class not found"
                )
            );
        }

        Course? course = await _collectionCourse.Find(doc => doc.Id == targetClassRoom.CourseId).FirstOrDefaultAsync(cancellationToken);
        Site? site = await _collectionSite.Find(doc => doc.Id == targetClassRoom.SiteId).FirstOrDefaultAsync(cancellationToken);

        int totalMinutes = (int)Math.Round(course.TotalMinutes * 60d);
        int classMinutes = (int)Math.Round(request.ClassRoomMinutes * 60d);

        int calcDays = (int)Math.Ceiling((double)totalMinutes / classMinutes);

        UpdateDefinition<ClassRoom> updateDef = Builders<ClassRoom>.Update
            .Set(doc => doc.ClassRoomName, request.ClassRoomName.ToNormalized())
            .Set(doc => doc.Tuition, request.Tuition)
            .Set(doc => doc.ClassRoomMinutes, request.ClassRoomMinutes)
            .Set(doc => doc.Days, calcDays)
            .Set(doc => doc.StartDate, request.StartDate)
            .Set(doc => doc.EndedDate, request.EndedDate)
            .Set(doc => doc.IsStarted, request.IsStarted)
            .Set(doc => doc.IsEnded, request.IsEnded)
            .Set(doc => doc.IsActive, request.IsActive);

        UpdateResult updateResult = await _collectionClassRoom.UpdateOneAsync(doc => doc.Id == targetClassRoom.Id, updateDef, null, cancellationToken);

        if (updateResult.ModifiedCount == 1)
        {
            ClassRoom? model = await _collectionClassRoom.Find(doc => doc.Id == targetClassRoom.Id).FirstOrDefaultAsync(cancellationToken);

            OperationResult<IEnumerable<string>> opResultUserNames = await GetProfessorUserNamesByIdsAsync(model.ProfessorsIds, cancellationToken);
            OperationResult<IEnumerable<string>> opResultNames = await GetProfessorNamesByIdsAsync(model.ProfessorsIds, cancellationToken);

            ShowCourseDto courseDto = Mappers.ConvertCourseToShowCourseDto(course);
            ShowSiteDto siteDto = Mappers.ConvertSiteToShowSiteDto(site);

            return new(
                true,
                Mappers.ConvertClassRoomToShowClassRoomDto(model, courseDto, siteDto, opResultUserNames.Result, opResultNames.Result),
                null
            );
        }

        return new(
            false,
            Error: new(
                ErrorCode.IsOperationFailed,
                "Class update failed! Try again"
            )
        );
    }

    public async Task<OperationResult> AddProfessorToClassRoomAsync(string targetClassRoomTitle, string professorUserName, CancellationToken cancellationToken)
    {
        string cleanClassRoomName = targetClassRoomTitle.ToNormalized();

        FindOptions options = new()
        {
            Collation = new Collation("en", strength: CollationStrength.Secondary)
        };

        ClassRoom targetClassRoom = await _collectionClassRoom.Find(doc => doc.ClassRoomName == cleanClassRoomName, options).FirstOrDefaultAsync(cancellationToken);

        if (targetClassRoom is null)
        {
            return new(
                false,
                Error: new(
                    ErrorCode.IsNotFound,
                    "Class not found"
                )
            );
        }

        ObjectId? professorId = await _collectionAppUser
            .Find(doc => doc.NormalizedUserName == professorUserName.ToNormalized(), options)
            .Project(doc => doc.Id)
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

        UpdateDefinition<ClassRoom> updateCourse = Builders<ClassRoom>.Update
            .AddToSet(doc => doc.ProfessorsIds, professorId.Value);

        UpdateResult updateResult = await _collectionClassRoom.UpdateOneAsync(doc => doc.Id == targetClassRoom.Id, updateCourse, null, cancellationToken);

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

    public async Task<OperationResult> RemoveProfessorFromClassRoomAsync(string targetClassRoomTitle, string professorUserName, CancellationToken cancellationToken)
    {
        string cleanClassRoomName = targetClassRoomTitle.ToNormalized();

        FindOptions options = new()
        {
            Collation = new Collation("en", strength: CollationStrength.Secondary)
        };

        ClassRoom targetClassRoom = await _collectionClassRoom.Find(doc => doc.ClassRoomName == cleanClassRoomName, options).FirstOrDefaultAsync(cancellationToken);

        if (targetClassRoom is null)
        {
            return new(
                false,
                Error: new(
                    ErrorCode.IsNotFound,
                    "Class not found"
                )
            );
        }

        ObjectId? professorId = await _collectionAppUser
            .Find(doc => doc.NormalizedUserName == professorUserName.ToNormalized(), options)
            .Project(doc => doc.Id)
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

        if (!targetClassRoom.ProfessorsIds.Contains(professorId.Value))
        {
            return new(
                false,
                Error: new(
                    ErrorCode.IsNotFound,
                    "This professor is not assigned to this class."
                )
            );
        }

        UpdateDefinition<ClassRoom> updateDef = Builders<ClassRoom>.Update
        .Pull(doc => doc.ProfessorsIds, professorId.Value);

        UpdateResult updateResult = await _collectionClassRoom.UpdateOneAsync(doc => doc.Id == targetClassRoom.Id, updateDef, null, cancellationToken);

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

    public async Task<OperationResult<ObjectId>> GetClassRoomIdByName(string classRoomName, CancellationToken cancellationToken)
    {
        string cleansSiteName = classRoomName.ToNormalized();

        FindOptions options = new()
        {
            Collation = new Collation("en", strength: CollationStrength.Secondary)
        };

        ObjectId? classId = await _collectionClassRoom
            .Find(doc => doc.ClassRoomName == cleansSiteName, options)
            .Project(doc => doc.Id)
            .FirstOrDefaultAsync(cancellationToken);

        if (classId is null)
        {
            return new(
                false,
                Error: new(
                    ErrorCode.IsSiteNotFound,
                    "Site not found"
                )
            );
        }

        return new(
            true,
            classId.Value,
            null
        );
    }

    public async Task<OperationResult> DeleteClassRoomAsync(ObjectId classRoomId, CancellationToken cancellationToken)
    {
        FilterDefinition<ClassRoom> idFilter = Builders<ClassRoom>.Filter.Eq(doc => doc.Id, classRoomId);

        FilterDefinition<ClassRoom> notAssignedFilter = Builders<ClassRoom>.Filter.In(
            doc => doc.CourseId,
            [null, ObjectId.Empty]
        );

        FilterDefinition<ClassRoom> finalFilter = Builders<ClassRoom>.Filter.And(idFilter, notAssignedFilter);

        DeleteResult deleteResult = await _collectionClassRoom.DeleteOneAsync(finalFilter, cancellationToken);

        if (deleteResult.DeletedCount == 0)
        {
            bool isExist = await _collectionClassRoom.Find(doc => doc.Id == classRoomId).AnyAsync(cancellationToken);

            if (!isExist)
            {
                return new(
                    false,
                    Error: new(
                        ErrorCode.IsClassRoomNotFound,
                        "ClassRoom not found!"
                    )
                );
            }

            return new(
                false,
                Error: new(
                    ErrorCode.IsDeleteNotAllowed,
                    "Cannot delete ClassRoom because it is assigned to a course."
                )
            );
        }

        return new(
            true,
            null
        );
    }
}