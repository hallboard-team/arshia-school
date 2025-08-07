namespace api.Extensions;

public static class ApplicationServiceExtensions
{
    public static IServiceCollection AddApplicationService(this IServiceCollection services, IConfiguration configuration, IHostEnvironment env)
    {
        #region MongoDbSettings
        ///// get values from this file: appsettings.Development.json /////
        // get section
        services.Configure<MyMongoDbSettings>(configuration.GetSection(nameof(MyMongoDbSettings)));

        // get values
        services.AddSingleton<IMyMongoDbSettings>(serviceProvider =>
        serviceProvider.GetRequiredService<IOptions<MyMongoDbSettings>>().Value);

        // get connectionString to the db
        services.AddSingleton<IMongoClient>(serviceProvider =>
        {
            MyMongoDbSettings uri = serviceProvider.GetRequiredService<IOptions<MyMongoDbSettings>>().Value;

            return new MongoClient(uri.ConnectionString);
        });
        #endregion MongoDbSettings

        #region Cors: baraye ta'eede Angular HttpClient requests
        services.AddCors(options =>
            {
              if (env.IsDevelopment())
              {
                options.AddDefaultPolicy(
                  policy => policy.WithOrigins("http://localhost:4200").AllowAnyHeader().AllowAnyMethod().
                    AllowCredentials()
                );
              }
              else
              {
                options.AddDefaultPolicy(
                  policy => policy.WithOrigins(
                    "https://gray-sand-0000a630f.2.azurestaticapps.net",
                    "https://domain.com",
                    "https://www.domain.com"
                  ).AllowAnyHeader().AllowAnyMethod().AllowCredentials()
                );
              }
            });
        #endregion Cors

        #region Other

        // services.AddScoped<LogUserActivity>(); // monitor/log userActivity

        #endregion Other

        return services;
    }
}
