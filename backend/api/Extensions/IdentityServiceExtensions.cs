using AspNetCore.Identity.MongoDbCore.Extensions;
using AspNetCore.Identity.MongoDbCore.Infrastructure;
using Microsoft.AspNetCore.Identity;

namespace api.Extensions;

public static class IdentityServiceExtensions
{
    public static IServiceCollection AddIdentityService(this IServiceCollection services, IConfiguration configuration)
    {
        #region Authentication & Authorization
        string tokenValue = configuration["TokenKey"]!;

        if (!string.IsNullOrEmpty(tokenValue))
        {
            services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuerSigningKey = true,
                        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(tokenValue)),
                        ValidateIssuer = false,
                        ValidateAudience = false,
                        ValidateLifetime = true
                        // RequireExpirationTime = true
                    };
                });
        }
        #endregion Authentication & Authorization

        #region MongoIdentity & Role
        var mongoDbSettings = configuration.GetSection(nameof(MyMongoDbSettings)).Get<MyMongoDbSettings>();

        if (mongoDbSettings is not null)
        {
            var mongoDbIdentityConfig = new MongoDbIdentityConfiguration
            {
                MongoDbSettings = new MongoDbSettings
                {
                    ConnectionString = mongoDbSettings.ConnectionString,
                    DatabaseName = mongoDbSettings.DatabaseName
                },
                IdentityOptionsAction = options =>
                {
                    options.Password.RequireDigit = false;
                    options.Password.RequiredLength = 8;
                    options.Password.RequireNonAlphanumeric = true;
                    options.Password.RequireLowercase = false;

                    // lockout
                    options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(10);
                    options.Lockout.MaxFailedAccessAttempts = 5;

                    options.User.RequireUniqueEmail = true; // OR UserName
                }
            };

            services.ConfigureMongoDbIdentity<AppUser, AppRole, ObjectId>(mongoDbIdentityConfig)
            .AddUserManager<UserManager<AppUser>>()
            .AddSignInManager<SignInManager<AppUser>>()
            .AddRoleManager<RoleManager<AppRole>>()
            .AddDefaultTokenProviders();
        }
        #endregion

        #region Policy
        services.AddAuthorizationBuilder()
            .AddPolicy("RequiredAdminRole", policy => policy.RequireRole("admin"))
            .AddPolicy("RequiredManagerRole", policy => policy.RequireRole("manager"))
            .AddPolicy("RequiredSecretaryRole", policy => policy.RequireRole("secretary"))
            .AddPolicy("RequiredTeacherRole", policy => policy.RequireRole("teacher"));
        #endregion

        return services;
    }
}