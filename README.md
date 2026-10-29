# CampusMart

CampusMart is a campus marketplace web app built with **.NET 10**.

- Students and faculty can browse products and place orders.
- Admin users can manage floors, stalls, and inventory.
- UI is being migrated to a simpler Tailwind-based design.

## Tech Stack

- .NET 10
- ASP.NET Core MVC + Razor Views
- ASP.NET Core Identity
- Entity Framework Core + SQL Server
- Tailwind CSS + JavaScript/jQuery

## Run Locally

```powershell
dotnet restore
cd CampusMart
npm install
npm run css:build
dotnet run
```

## Project Layout

- `CampusMart.slnx` — solution file
- `CampusMart/` — main web project

For full setup notes, see: `CampusMart/README.md`.
