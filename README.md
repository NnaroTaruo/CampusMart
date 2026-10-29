# CampusMart

A campus marketplace built with **ASP.NET Core MVC and .NET 10**. Students can browse campus stalls, buy products, and submit their own listings. Administrators manage floors, stalls, inventory, student accounts, and listing approvals.

## Contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Accounts](#accounts)
- [Useful commands](#useful-commands)
- [Project structure](#project-structure)
- [Project status](#project-status)
- [License](#license)

## Features

### Students

- Register and sign in using a student ID.
- Browse marketplace products and campus stalls.
- Add products to a cart, place orders, and view order history.
- Submit products for sale and wait for admin approval.
- Update profile information and a profile picture.

### Administrators

- Create floors and track stall occupancy.
- Create and edit stalls, set opening hours, and manage inventory.
- Activate or deactivate stalls.
- Approve or reject stall items and student listings.
- Create, view, edit, and delete student accounts.

The admin interface includes SVG icons, loading feedback, keyboard-accessible dialogs, and animations that respect reduced-motion preferences.

## Tech stack

| Area | Technology |
| --- | --- |
| Application | .NET 10, ASP.NET Core MVC, Razor views |
| Authentication | ASP.NET Core Identity |
| Database | SQL Server with Entity Framework Core |
| Styling | Tailwind CSS, Bootstrap, and custom CSS |
| Frontend behavior | JavaScript and jQuery |

## Getting started

### Requirements

- .NET 10 SDK
- Node.js and npm
- SQL Server or SQL Server LocalDB
- Git

The steps below use **PowerShell on Windows** with SQL Server LocalDB installed.

### 1. Clone the repository

```powershell
git clone https://github.com/NnaroTaruo/CampusMart.git
cd CampusMart
```

You are now in the repository root, which contains `CampusMart.slnx`.

### 2. Install dependencies and build the styles

```powershell
dotnet restore CampusMart.slnx
cd CampusMart
npm ci
npm run css:build
```

You are now in the application folder, which contains `CampusMart.csproj`. Keep this terminal open for the next steps.

### 3. Configure the database

For a local development database, set the connection string in the current terminal:

```powershell
$env:ConnectionStrings__DefaultConnection = 'Server=(localdb)\MSSQLLocalDB;Database=CampusMart;Trusted_Connection=True;TrustServerCertificate=True'
```

This overrides `ConnectionStrings:DefaultConnection` in the application settings. If you use another SQL Server instance, replace the example with your own connection string. Set the variable again when opening a new terminal, and keep database credentials out of Git.

### 4. Start the application

```powershell
dotnet run --launch-profile http
```

Open **[http://localhost:5045](http://localhost:5045)** in your browser.

The `http` launch profile selects the **Development** environment. In that environment, startup applies the existing database migrations and seeds the development administrator. SQL Server must be available before starting the app.

## Accounts

### Student account

Open `/Account/Register` to create an account, then sign in at `/Account/Login` using your student ID and password.

### Development admin account

For a fresh development database, the app creates this administrator:

| Sign-in field | Value |
| --- | --- |
| Student ID | `admin` |
| Password | `Admin@123` |

Sign in at `/Account/Login`. Administrators are redirected to `/Admin`, where floor management opens first.

Admin seeding is defined in [Program.cs](CampusMart/Program.cs) and runs only in **Development**. These credentials are for local development; replace them before deploying the application.

## Useful commands

| Task | Run from | Command |
| --- | --- | --- |
| Build the application | Repository root | `dotnet build CampusMart.slnx` |
| Run frontend interaction checks | Repository root | `node CampusMart/tests/frontend-interactions.cjs` |
| Rebuild Tailwind CSS | Application folder | `npm run css:build` |
| Watch Tailwind changes | Application folder, in a second terminal | `npm run css:watch` |

Tailwind source styles live in `CampusMart/Styles/tailwind.css`. The generated stylesheet is `CampusMart/wwwroot/css/tailwind.css`. Admin styles and behavior live in `CampusMart/wwwroot/css/admin.css` and `CampusMart/wwwroot/js/`.

For additional frontend notes, see the [application README](CampusMart/README.md).

## Project structure

```text
CampusMart.slnx          Solution file
CampusMart/
  Areas/Admin/          Admin controllers and views
  Controllers/          Marketplace, account, cart, order, and profile routes
  Data/                 Database context
  Migrations/           Entity Framework database migrations
  Models/               Entities and view models
  Services/             Application services
  Styles/               Tailwind source styles
  Views/                Razor views and shared layouts
  tests/                Frontend interaction checks
  wwwroot/              CSS, JavaScript, icons, images, and other static assets
  Program.cs            Startup, authentication, routing, and development seeding
```

## Project status

CampusMart is under active development. Tailwind is being introduced gradually alongside existing Bootstrap and custom CSS.

- Password reset currently displays a confirmation message; email delivery is not implemented.
- Admin platform settings, notifications, and store oversight contain placeholder behavior or sample content.

## License

Released under the [MIT License](LICENSE).
