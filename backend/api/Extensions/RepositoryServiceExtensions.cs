using image_processing.Interfaces;
using image_processing.Services;

namespace api.Extensions;

public static class RepositoryServiceExtensions
{
    public static IServiceCollection AddRepositoryServices(this IServiceCollection services)
    {
        #region Dependency Injections
        services.AddScoped<ITokenService, TokenService>();

        services.AddScoped<IAccountRepository, AccountRepository>();
        services.AddScoped<IMemberRepository, MemberRepository>();
        services.AddScoped<ITeacherRepository, TeacherRepository>();
        services.AddScoped<IAdminRepository, AdminRepository>();
        services.AddScoped<IManagerRepository, ManagerRepository>();
        services.AddScoped<ISecretaryRepository, SecretaryRepository>();
        services.AddScoped<ICourseRepository, CourseRepository>();
        services.AddScoped<IPhotoService, PhotoService>();
        services.AddScoped<IPhotoModifySaveService, PhotoModifySaveService>();

        #endregion Dependency Injections

        return services;
    }
}
