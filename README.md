## 🚀 Tech Stack

### **Backend**
![.NET](https://img.shields.io/badge/.NET-10-512BD4?style=flat-square&logo=dotnet&logoColor=white)
![C#](https://img.shields.io/badge/C%23-239120?style=flat-square&logo=c-sharp&logoColor=white)
![ASP.NET Core](https://img.shields.io/badge/ASP.NET_Core-Web_API-512BD4?style=flat-square&logo=dotnet&logoColor=white)
![SQL Server](https://img.shields.io/badge/SQL_Server-CC2927?style=flat-square&logo=microsoft-sql-server&logoColor=white)
![Entity Framework](https://img.shields.io/badge/Entity_Framework-Core-512BD4?style=flat-square&logo=dotnet&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=flat-square&logo=json-web-tokens&logoColor=white)

### **Frontend**
![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-UI-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=flat-square&logo=axios&logoColor=white)

### **Architecture & Patterns**
![Clean Architecture](https://img.shields.io/badge/Clean_Architecture-4A148C?style=flat-square)
![CQRS](https://img.shields.io/badge/CQRS-FF5722?style=flat-square)
![MediatR](https://img.shields.io/badge/MediatR-0078D7?style=flat-square)
![Dapper](https://img.shields.io/badge/Dapper-808080?style=flat-square)
# 🛡️ Whistleblowing Management System

A secure, enterprise-grade workplace reporting platform that allows employees to raise concerns anonymously, track case progress, and support investigations with evidence and audit-friendly workflows.

This repository contains the full application stack:

- .NET 10 backend API
- SQL Server data layer
- React + Vite frontend
- Role-based access control for employees, managers, investigators, and administrators

---

## Overview

The system is designed to help organizations receive confidential complaints, manage investigation workflows, and provide reporting dashboards for operational oversight. It follows Clean Architecture, CQRS-style application logic, and a layered structure to keep business rules, infrastructure, and presentation responsibilities separated.

---

## Tech Stack

### Backend
- ASP.NET Core Web API
- .NET 10
- Entity Framework Core
- Dapper for read-optimized queries
- JWT authentication
- FluentValidation for validation
- SQL Server database
- BCrypt password hashing

### Frontend
- React
- Vite
- Tailwind CSS
- React Router DOM
- Axios for API calls
- Recharts for dashboard analytics

---

## Key Features

- Secure authentication and role-based authorization
- Anonymous reporting with a reference code for follow-up
- Complaint and case management
- Investigation workflow with evidence uploads
- Department and user administration
- Dashboard analytics for admins, managers, and investigators
- Email notifications for account and investigation updates
- Secure file validation for uploads

---

## Project Structure

```text
Whistleblowing/
├── Whistleblowing.Api               (ASP.NET Core API)
├── Whistleblowing.Application       (CQRS handlers, DTOs, validators)
├── Whistleblowing.Domain            (Entities, enums, domain model)
├── Whistleblowing.Infrastructure    (EF Core, database services, integrations)
├── Whistleblowing.UI                (React frontend)
├── Whistleblowing.slnx              (Solution file)
├── web.config                       (hosting-related config)
└── README.md                        (project documentation)
```

---

## Prerequisites

Before running the project, install:

- .NET 10 SDK
- Node.js 18 or later
- SQL Server Express or LocalDB
- Visual Studio 2022 or VS Code

---

## Configuration

### Backend settings
Update the connection string and JWT values in:

`Whistleblowing.Api/appsettings.json`

Example configuration:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost\\SQLEXPRESS;Database=WhistleblowingDb;Trusted_Connection=True;TrustServerCertificate=True;MultipleActiveResultSets=true"
  },
  "Jwt": {
    "Secret": "REPLACE_WITH_A_STRONG_SECRET_KEY",
    "Issuer": "WhistleblowingSystem",
    "Audience": "WhistleblowingSystemUsers",
    "ExpiryDays": 7
  }
}
```

### Frontend environment
Create or update:

`Whistleblowing.UI/.env`

```env
VITE_API_URL=http://localhost:5064
```

---

## Running the Project

### 1. Restore and build the backend

```bash
cd Whistleblowing.Api
dotnet restore
dotnet build
```

### 2. Apply database migrations

```bash
dotnet ef database update --project ../Whistleblowing.Infrastructure --startup-project Whistleblowing.Api.csproj
```

If the `dotnet-ef` tool is not available, install it first:

```bash
dotnet tool install --global dotnet-ef
```

### 3. Start the API

```bash
cd Whistleblowing.Api
dotnet run
```

The API runs by default on:

- http://localhost:5064

### 4. Start the frontend

```bash
cd Whistleblowing.UI
npm install
npm run dev
```

The React app runs by default on:

- http://localhost:5173

---

## Development Notes

- The frontend expects the API base URL from `VITE_API_URL`.
- The backend uses SQL Server; ensure the database server is reachable before running migration and startup commands.
- For production or staging environments, replace local secrets and SMTP credentials with secure environment-based configuration.

---

## License

This project is intended for internal or organizational use and should be governed by the licensing terms defined by the owning team or organization.

---

## Contributing

1. Create a feature branch.
2. Make your changes with clear commit messages.
3. Validate the relevant API and UI behavior.
4. Submit a pull request for review.
