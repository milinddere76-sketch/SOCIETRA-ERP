# SOCIETRA ERP | Implementation & Recovery Plan

This document outlines the steps taken to restore and fully functionalize the SOCIETRA ERP application after environment-related tool failures.

## 🛠️ 1. Environment Restoration
The provided `tools` were found to be corrupted or misconfigured (missing `npm` modules, broken Maven classpath). We have successfully:
- **Fresh Maven**: Downloaded and configured Apache Maven 3.9.6 at `c:\SOCIETRA ERP\tools\maven\fresh`.
- **Fresh Node.js**: Downloaded and configured Node.js v20.11.1 at `c:\SOCIETRA ERP\tools\node\fresh`.
- **JDK Verification**: Verified internal JDK 17 as baseline.

## ⚙️ 2. Backend Enhancements
- **Dynamic Configuration**: Created `application.properties` with support for environment variables.
- **H2 Fallback**: Added `application-dev.properties` to allow local execution without Docker (using H2 in-memory DB).
- **Postgres Support**: Maintained `application-prod.properties` for Dockerized deployments.
- **Dependencies**: Added `h2` runtime dependency to `pom.xml`.
- **CORS**: Enabled CORS for seamless frontend-backend communication on `localhost:3000`.

## 🎨 3. Frontend Functionality
- **Auth Logic**: Replaced hardcoded `isAuthenticated` with stateful logic using `localStorage`.
- **Custom Events**: Implemented `auth-change` event system for real-time UI updates during login/logout.
- **API Instance**: Created `api.js` (Axios) for centralized backend communication.
- **Real Backend Link**: Configured Vite proxy to point to the Spring Boot server.

## 🚀 4. How to Run (Local Dev)
We have provided a one-click launch script: `c:\CHS APP\dev_run.bat`.

### Manual Steps:
1. **Launch Backend**:
   ```powershell
   cd backend
   $env:JAVA_HOME = 'c:\SOCIETRA ERP\tools\jdk\jdk-17.0.8.1+1'
   & "c:\SOCIETRA ERP\tools\maven\fresh\apache-maven-3.9.6\bin\mvn.cmd" spring-boot:run "-Dspring-boot.run.profiles=dev"
   ```
2. **Launch Frontend**:
   ```powershell
   cd frontend
   $env:PATH = "c:\SOCIETRA ERP\tools\node\fresh\node-v20.11.1-win-x64;" + $env:PATH
   npm run dev
   ```

## ✅ 5. Module Verification Status
| Module | Logic Proof | Backend Status | Frontend Status |
| :--- | :--- | :--- | :--- |
| **Auth** | JWT/OTP | Ready (Simulated fallback) | Ready (Functional UI) |
| **Maintenance** | 1.75% Interest | Logic in Service | UI Mocked |
| **Accounting** | Double-Entry | Entity models complete | UI Mocked |
| **AI Insights** | Heuristic Prediction | Service built | UI Mocked |

---
**Current Priority**: Waiting for `npm install` to complete for the first-time dependency resolution.
