using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using CampusMart.Data;
using CampusMart.Models.Entities;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllersWithViews();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection")));

// Identity
builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
{
    options.Password.RequireDigit = false;
    options.Password.RequireLowercase = false;
    options.Password.RequireUppercase = false;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequiredLength = 6;
})
.AddEntityFrameworkStores<AppDbContext>()
.AddDefaultTokenProviders();

builder.Services.ConfigureApplicationCookie(options =>
{
    options.LoginPath = "/Account/Login";
    options.LogoutPath = "/Account/Logout";
    options.AccessDeniedPath = "/Account/Login";
});

var app = builder.Build();

// Seed a static admin user (DEV-only).
// Replace these development credentials before using the application outside local development.
// Identity hashes the password; we still recommend replacing this with a safer approach for production.
if (app.Environment.IsDevelopment())
{
    using (var scope = app.Services.CreateScope())
    {
        var services = scope.ServiceProvider;
        var db = services.GetRequiredService<AppDbContext>();
        await db.Database.MigrateAsync();

        var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();
        var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();

        const string adminRole = "Admin";
        if (!await roleManager.RoleExistsAsync(adminRole))
        {
            await roleManager.CreateAsync(new IdentityRole(adminRole));
        }

        var adminCredentials = new[] 
        {
            new { Id = "admin", Pass = "Admin@123", Name = "Admin" }
        };

        foreach (var admin in adminCredentials)
        {
            var adminUser = await userManager.FindByNameAsync(admin.Id);
            var legacyAdmin = await userManager.FindByNameAsync("23769862");

            if (adminUser == null && legacyAdmin != null)
            {
                adminUser = legacyAdmin;
                adminUser.UserName = admin.Id;
                adminUser.NormalizedUserName = admin.Id.ToUpperInvariant();
                adminUser.Email = "admin@campusmart.local";
                adminUser.NormalizedEmail = "ADMIN@CAMPUSMART.LOCAL";
                adminUser.StudentId = null;

                var updateResult = await userManager.UpdateAsync(adminUser);
                if (!updateResult.Succeeded)
                {
                    throw new InvalidOperationException(
                        $"Failed to update the legacy admin user: {string.Join(", ", updateResult.Errors.Select(e => e.Description))}"
                    );
                }

                await userManager.RemovePasswordAsync(adminUser);
                await userManager.AddPasswordAsync(adminUser, admin.Pass);
            }

            if (adminUser == null)
            {
                adminUser = new ApplicationUser
                {
                    UserName = admin.Id,
                    Email = "admin@campusmart.local",
                    FullName = admin.Name,
                    DateTime = DateTime.UtcNow,
                };

                var createResult = await userManager.CreateAsync(adminUser, admin.Pass);
                if (!createResult.Succeeded)
                {
                    // Fail loudly during dev so you notice misconfiguration.
                    throw new InvalidOperationException(
                        $"Failed to create admin user {admin.Id}: {string.Join(", ", createResult.Errors.Select(e => e.Description))}"
                    );
                }
            }

            if (!await userManager.IsInRoleAsync(adminUser, adminRole))
            {
                await userManager.AddToRoleAsync(adminUser, adminRole);
            }
        }
    }
}

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

app.MapStaticAssets();

app.MapControllerRoute(
    name: "areas",
    pattern: "{area:exists}/{controller=Dashboard}/{action=Index}/{id?}");

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=HomeIndex}/{id?}")
    .WithStaticAssets();


app.Run();
