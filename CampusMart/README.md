# CampusMart

CampusMart is a campus marketplace built with ASP.NET Core and .NET 10. Students and faculty can browse products from campus sellers, manage a cart, and place orders. Administrators manage campus floors, stalls, and inventory.

## Technology

- .NET 10
- ASP.NET Core MVC with Razor views
- ASP.NET Core Identity
- Entity Framework Core with SQL Server
- Tailwind CSS for migrated pages
- Bootstrap and existing CSS for legacy pages during the gradual migration

## Run locally

### Requirements

- .NET 10 SDK
- Node.js and npm
- SQL Server or SQL Server LocalDB

### Setup

1. Configure the database connection in local configuration. Do not commit credentials.
2. Restore .NET dependencies:

   ```powershell
   dotnet restore
   ```

3. Install frontend dependencies from the `CampusMart` project directory:

   ```powershell
   npm install
   ```

4. Build Tailwind CSS:

   ```powershell
   npm run css:build
   ```

5. Start the application:

   ```powershell
   dotnet run
   ```

For active frontend development, use a second terminal and run:

```powershell
npm run css:watch
```

The Tailwind source is in `Styles/tailwind.css`. The generated file is `wwwroot/css/tailwind.css`.

## Frontend migration

Tailwind is being introduced gradually. New or migrated pages should use Tailwind utilities and the reusable classes in `Styles/tailwind.css`. Existing Bootstrap and CSS files remain available until their pages are migrated and tested.

Current migrated surfaces:

- Shared public layout navigation and footer
- Store listing page

Do not add another CSS framework. Keep shared styles small and prefer existing Tailwind utilities before adding custom classes.

## Project structure

```text
Areas/              Administrator routes and views
Controllers/        Public MVC controllers
Data/               Entity Framework database context
Models/             Entities and view models
Styles/             Tailwind source styles
Views/              Razor views
wwwroot/            Static assets and compiled CSS
```

## Security

- Never commit passwords, API keys, or production connection strings.
- Use user secrets, environment variables, or local configuration for development credentials.
- Change all seeded development credentials before using the application outside local development.
